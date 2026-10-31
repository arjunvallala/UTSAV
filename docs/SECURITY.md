# Security notes

## Threat model

Protect the Gemini credential, prevent malformed or oversized requests, limit automated use, and avoid collecting personal identifiers. User supplied event text is untrusted and may contain prompt injection. Treat vendor names, quotes and all plan content as user input; never render it as HTML. Provider output is untrusted until Zod parsing succeeds.

## Controls in this release

- Gemini key is read only in server code from `GEMINI_API_KEY`; never prefix it with `NEXT_PUBLIC_`.
- Strict request and response schemas, 12 KB body limit, 2,000 character prompt bound and generic API errors.
- Same-origin check, per-process 20 requests/minute limiter, and response security headers including CSP, frame denial, and MIME sniffing protection.
- Compact context allowlist excludes contact details and identifiers. Plans are stored in localStorage and not logged.
- One output validation attempt; invalid response/provider errors fall back to deterministic guidance.

## Residual risks

The in-memory limiter does not coordinate across instances or enforce a daily account quota. CSP includes inline allowances needed by the current Next.js setup. Browser localStorage is accessible to scripts executing in the origin and is not encrypted. The current dependency audit has zero high/critical advisories; remaining moderate development-tool advisories are tracked in the lockfile audit output. Deployments should add a shared rate/quota store, dependency/secret scanning, a restrictive nonce CSP, HTTPS, and operational monitoring before handling real event data at scale.
