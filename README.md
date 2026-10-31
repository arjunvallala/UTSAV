# Utsav

An intelligent, local-first event planning studio. Start with a fully populated sample wedding and explore the budget, timeline, vendors, ideas, readiness score and what-if simulator without creating an account.

## Start locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add a server-side `GEMINI_API_KEY` to enable Gemini. The app runs without a key using deterministic fallback advice. `GEMINI_MODEL` defaults to `gemini-3.8-flash`.

## Deploy to Netlify

Connect this repository in Netlify. The checked-in `netlify.toml` sets the Next.js build and publish directory; Netlify detects Next.js and applies its managed runtime for App Router pages and API routes. Set `GEMINI_API_KEY` in **Site configuration → Environment variables** to enable the assistant's Gemini responses. Without it, the assistant uses the built-in fallback. `GEMINI_MODEL` is optional. Redeploy after changing environment variables.

Netlify builds use Next.js output for Netlify's runtime, while local and Docker builds retain standalone output.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Privacy

Event data is kept in this browser. A compact selection of event details is sent to the assistant API only when you choose to ask for help. The API does not log request content. See [docs/SECURITY.md](docs/SECURITY.md).

## Project notes

Architecture, evaluation coverage and remaining work are documented in [docs/SUBMISSION.md](docs/SUBMISSION.md). This implementation is a functional demo baseline, not yet evidence of the full production definition of done in the original brief.
