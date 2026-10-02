# GEO Visibility Tracker

Runs your prompts on real AI engines, saves every raw answer and citation, then computes visibility, share of voice, sentiment and sources from that evidence. Reddit and Quora/forum posts are collected for the brand, category and product.

## Run
```
pip install -r requirements.txt
cp .env.example .env     # add keys
uvicorn app:app --reload # open http://localhost:8000
```

## APIs you need
| Purpose | API | Key |
|---|---|---|
| ChatGPT answers + citations | OpenAI Responses API with web search | OPENAI_API_KEY |
| Perplexity answers + citations | Perplexity Sonar API | PERPLEXITY_API_KEY |
| Gemini answers + sources | Gemini API with Google Search grounding | GEMINI_API_KEY |
| Claude answers + sources, and the sentiment judge (required) | Anthropic API | ANTHROPIC_API_KEY |
| Reddit discussions | Reddit official API (create an app at reddit.com/prefs/apps) | REDDIT_CLIENT_ID / SECRET |
| Quora, G2, Trustpilot, HN | Serper.dev Google search (Quora has no public API) | SERPER_API_KEY |

Not included here: Google AI Overviews, Copilot, Grok, DeepSeek (use a provider like DataForSEO or SerpApi for AI Overviews), GA4/GSC, alerts, and scheduling. For daily tracking, call POST /api/run from a cron job.

## How accuracy is protected
- Mentions: exact word-match on the saved raw answer, no model guessing.
- Sentiment: labelled by Claude, but kept only if its quote appears verbatim in the answer; otherwise marked "unverified".
- Every metric links back to the saved answer, its prompt, time and cited URLs.
- Each prompt runs REPEATS times per engine; visibility shows a 95% range because AI answers vary.
- Gemini citations are source domains, not full URLs (the API returns redirect links).
