import os, re, json, sqlite3, asyncio, time, math
from urllib.parse import urlparse
import httpx
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
K = lambda n: os.getenv(n, "")
REPEATS = int(os.getenv("REPEATS", 3))
CLAUDE = os.getenv("CLAUDE_MODEL", "claude-sonnet-5-5")
UA = "geo-tool/1.0"
app = FastAPI()
STATUS = {}

def db():
    c = sqlite3.connect("geo.db"); c.row_factory = sqlite3.Row; return c
with db() as c:
    c.executescript("""
    create table if not exists proj(name text primary key, cfg text);
    create table if not exists answers(id integer primary key, project text, run text, engine text, prompt text, text text, urls text, ts real);
    create table if not exists judg(answer_id int, entity text, mentioned int, sentiment text, quote text);
    create table if not exists social(id integer primary key, project text, run text, platform text, query text, title text, snippet text, url text, score int, sentiment text, quote text, ts real);""")

# ---------- AI engines: each returns (answer_text, [cited urls]) ----------
async def ask_openai(h, q):
    r = await h.post("https://api.openai.com/v1/responses", headers={"Authorization": "Bearer " + K("OPENAI_API_KEY")},
        json={"model": os.getenv("OPENAI_MODEL", "gpt-4.1"), "tools": [{"type": "web_search_preview"}], "input": q})
    r.raise_for_status(); t = ""; u = []
    for o in r.json().get("output", []):
        if o.get("type") == "message":
            for c in o["content"]:
                t += c.get("text", ""); u += [a["url"] for a in c.get("annotations", []) if a.get("type") == "url_citation"]
    return t, u

async def ask_pplx(h, q):
    r = await h.post("https://api.perplexity.ai/chat/completions", headers={"Authorization": "Bearer " + K("PERPLEXITY_API_KEY")},
        json={"model": "sonar", "messages": [{"role": "user", "content": q}]})
    r.raise_for_status(); j = r.json()
    return j["choices"][0]["message"]["content"], j.get("citations", [])

async def ask_gemini(h, q):
    m = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    r = await h.post(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={K('GEMINI_API_KEY')}",
        json={"contents": [{"parts": [{"text": q}]}], "tools": [{"google_search": {}}]})
    r.raise_for_status(); c = r.json()["candidates"][0]
    t = "".join(p.get("text", "") for p in c["content"]["parts"])
    # Gemini returns redirect links; the chunk title is the real source domain
    return t, [g["web"].get("title", "") for g in c.get("groundingMetadata", {}).get("groundingChunks", []) if "web" in g]

async def ask_claude(h, q):
    r = await h.post("https://api.anthropic.com/v1/messages", headers={"x-api-key": K("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01"},
        json={"model": CLAUDE, "max_tokens": 1500, "tools": [{"type": "web_search_20250305", "name": "web_search", "max_uses": 3}],
              "messages": [{"role": "user", "content": q}]})
    r.raise_for_status(); t = ""; u = []
    for b in r.json()["content"]:
        if b["type"] == "text": t += b["text"]
        if b["type"] == "web_search_tool_result" and isinstance(b["content"], list): u += [x["url"] for x in b["content"] if "url" in x]
    return t, u

ENGINES = {"chatgpt": (ask_openai, "OPENAI_API_KEY"), "perplexity": (ask_pplx, "PERPLEXITY_API_KEY"),
           "gemini": (ask_gemini, "GEMINI_API_KEY"), "claude": (ask_claude, "ANTHROPIC_API_KEY")}

# ---------- Forums: Reddit official API, Quora via Google (Serper) ----------
async def reddit(h, q):
    a = await h.post("https://www.reddit.com/api/v1/access_token", auth=(K("REDDIT_CLIENT_ID"), K("REDDIT_CLIENT_SECRET")),
        data={"grant_type": "client_credentials"}, headers={"User-Agent": UA})
    tok = a.json()["access_token"]
    r = await h.get("https://oauth.reddit.com/search", params={"q": q, "limit": 20, "sort": "relevance", "t": "year"},
        headers={"Authorization": "bearer " + tok, "User-Agent": UA})
    return [(p["data"]["title"], p["data"]["selftext"][:700], "https://reddit.com" + p["data"]["permalink"], p["data"]["score"])
            for p in r.json()["data"]["children"]]

async def serp_site(h, site, q):
    r = await h.post("https://google.serper.dev/search", headers={"X-API-KEY": K("SERPER_API_KEY")}, json={"q": f"site:{site} {q}", "num": 10})
    return [(o["title"], o.get("snippet", ""), o["link"], 0) for o in r.json().get("organic", [])]

# ---------- Judge: deterministic mentions + LLM sentiment with verified quotes ----------
norm = lambda s: re.sub(r"\s+", " ", s).lower()
def pj(s):
    try: return json.loads(s[s.index("{"): s.rindex("}") + 1])
    except Exception: return {}

async def judge(h, text, ents):
    found = {e: bool(re.search(r"\b" + re.escape(e) + r"\b", text, re.I)) for e in ents}
    res = {}
    todo = [e for e in ents if found[e]]
    if todo:
        p = (f"Text:\n{text[:6000]}\n\nFor each entity in {todo}: sentiment of the Text toward it (positive, neutral or negative) and ONE verbatim quote "
             'copied exactly from the Text. Return ONLY JSON: {"results":[{"entity":"","sentiment":"","quote":""}]}')
        try:
            r = await h.post("https://api.anthropic.com/v1/messages", headers={"x-api-key": K("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01"},
                json={"model": CLAUDE, "max_tokens": 1200, "messages": [{"role": "user", "content": p}]})
            for x in pj(r.json()["content"][0]["text"]).get("results", []): res[x.get("entity")] = x
        except Exception: pass
    out = []
    for e in ents:
        if not found[e]: out.append((e, 0, "none", "")); continue
        x = res.get(e, {}); q = x.get("quote", ""); s = x.get("sentiment", "")
        ok = q and norm(q) in norm(text) and s in ("positive", "neutral", "negative")
        out.append((e, 1, s if ok else "unverified", q if ok else ""))  # unverifiable LLM output is never counted as a fact
    return out

# ---------- Pipeline ----------
class Cfg(BaseModel):
    project: str; brand: str; domain: str = ""; category: str = ""
    competitors: list[str] = []; prompts: list[str]; social_queries: list[str] = []

async def pipeline(cfg: Cfg, run: str):
    ents = [cfg.brand] + cfg.competitors
    sem = asyncio.Semaphore(6)
    async with httpx.AsyncClient(timeout=120) as h:
        async def one(eng, q):
            async with sem:
                try: t, u = await ENGINES[eng][0](h, q)
                except Exception as ex: STATUS[run]["errors"].append(f"{eng}: {ex}"); return
                J = await judge(h, t, ents)
                with db() as c:
                    i = c.execute("insert into answers(project,run,engine,prompt,text,urls,ts) values(?,?,?,?,?,?,?)", (cfg.project, run, eng, q, t, json.dumps(u), time.time())).lastrowid
                    c.executemany("insert into judg values(?,?,?,?,?)", [(i, *j) for j in J])
                STATUS[run]["done"] += 1
        jobs = [one(e, q) for e, (_, k) in ENGINES.items() if K(k) for q in cfg.prompts for _ in range(REPEATS)]
        STATUS[run]["total"] = len(jobs)
        await asyncio.gather(*jobs)
        sq = cfg.social_queries or [cfg.brand, cfg.brand + " review", cfg.category]
        for plat, fn, key in [("reddit", reddit, "REDDIT_CLIENT_ID"), ("quora", lambda h, q: serp_site(h, "quora.com", q), "SERPER_API_KEY"),
                              ("forums", lambda h, q: serp_site(h, "news.ycombinator.com OR site:trustpilot.com OR site:g2.com", q), "SERPER_API_KEY")]:
            if not K(key): continue
            for q in filter(None, sq):
                try: posts = await fn(h, q)
                except Exception as ex: STATUS[run]["errors"].append(f"{plat}: {ex}"); continue
                for title, snip, url, score in posts[:12]:
                    J = (await judge(h, title + ". " + snip, [cfg.brand]))[0]
                    with db() as c:
                        c.execute("insert into social(project,run,platform,query,title,snippet,url,score,sentiment,quote,ts) values(?,?,?,?,?,?,?,?,?,?,?)",
                                  (cfg.project, run, plat, q, title, snip, url, score, J[2] if J[1] else "not_mentioned", J[3], time.time()))
    STATUS[run]["finished"] = True

@app.post("/api/run")
async def run(cfg: Cfg, bg: BackgroundTasks):
    rid = str(int(time.time()))
    STATUS[rid] = {"done": 0, "total": 0, "errors": [], "finished": False}
    with db() as c: c.execute("insert or replace into proj values(?,?)", (cfg.project, cfg.model_dump_json()))
    bg.add_task(pipeline, cfg, rid)
    return {"run": rid}

@app.get("/api/status")
def status(run: str): return STATUS.get(run, {})

dom = lambda u: re.sub(r"^www\.", "", urlparse(u).netloc or u).lower()
def wilson(k, n, z=1.96):
    if not n: return 0, 0
    p = k / n; d = 1 + z * z / n; m = p + z * z / (2 * n); s = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return round((m - s) / d * 100), round((m + s) / d * 100)

@app.get("/api/report")
def report(project: str):
    c = db()
    row = c.execute("select cfg from proj where name=?", (project,)).fetchone()
    run = c.execute("select max(run) m from answers where project=?", (project,)).fetchone()["m"]
    if not row or not run: return {}
    cfg = json.loads(row["cfg"]); brand = cfg["brand"]; ents = [brand] + cfg["competitors"]
    A = [dict(x) for x in c.execute("select * from answers where project=? and run=?", (project, run))]
    J = {}
    for x in c.execute("select * from judg where answer_id in (select id from answers where project=? and run=?)", (project, run)):
        J.setdefault(x["answer_id"], {})[x["entity"]] = dict(x)
    n = len(A); hit = lambda a, e=brand: J.get(a["id"], {}).get(e, {}).get("mentioned")
    hits = [a for a in A if hit(a)]
    eng = {}
    for a in A:
        d = eng.setdefault(a["engine"], {"n": 0, "hits": 0}); d["n"] += 1; d["hits"] += 1 if hit(a) else 0
    mention_total = sum(1 for a in A for e in ents if hit(a, e)) or 1
    sov = {e: round(sum(1 for a in A if hit(a, e)) / mention_total * 100, 1) for e in ents}
    sent = {}
    for a in hits:
        s = J[a["id"]][brand]["sentiment"]; sent[s] = sent.get(s, 0) + 1
    cites = {}
    for a in A:
        for u in set(json.loads(a["urls"])):
            d = cites.setdefault(dom(u), {"count": 0, "answers": [], "urls": []}); d["count"] += 1; d["answers"].append(a["id"]); d["urls"].append(u)
    trend = [dict(x) for x in c.execute("select a.run, count(*) n, sum(j.mentioned) h from answers a join judg j on j.answer_id=a.id and j.entity=? where a.project=? group by a.run order by a.run", (brand, project))]
    social = [dict(x) for x in c.execute("select platform,query,title,snippet,url,score,sentiment,quote from social where project=? and run=?", (project, run))]
    lo, hi = wilson(len(hits), n)
    return {"cfg": cfg, "run": run, "n": n, "visibility": round(len(hits) / n * 100) if n else 0, "ci": [lo, hi], "by_engine": eng, "sov": sov, "sentiment": sent,
            "brand_cited": sum(1 for a in A if cfg["domain"] and any(cfg["domain"] in dom(u) for u in json.loads(a["urls"]))),
            "cites": sorted([{"domain": k, **v} for k, v in cites.items()], key=lambda x: -x["count"])[:25], "trend": trend, "social": social,
            "answers": [{"id": a["id"], "engine": a["engine"], "prompt": a["prompt"], "mentioned": hit(a), "sentiment": J.get(a["id"], {}).get(brand, {}).get("sentiment"),
                         "quote": J.get(a["id"], {}).get(brand, {}).get("quote")} for a in A]}

@app.get("/api/answer/{i}")
def answer(i: int):
    r = db().execute("select * from answers where id=?", (i,)).fetchone()
    return dict(r) if r else {}

@app.get("/")
def home(): return FileResponse("static/index.html")
