# Smart Business Automation — Vercel Edition

Google AI Studio SDK and branding removed. React/Vite frontend and Express API preserved. AI drafting is a clearly labeled local demo fallback, not a live LLM.

## Deploy
1. Upload this folder to GitHub.
2. In Vercel choose Add New > Project > Import Git Repository.
3. Framework: Vite. Build command: `npm run build`. Output: `dist`.
4. Deploy. No Google API key is required.

## Local
`npm install` then `npm run dev`.

## Important
The Express backend uses in-memory arrays. On Vercel data changes are **not persistent** and may reset between invocations. This is a portfolio/demo deployment, not a production CRM. For real client data add a database, authentication, validation, and access controls.
