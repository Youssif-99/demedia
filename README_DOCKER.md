Deployment (single container)

Build args/env:
- NEXT_PUBLIC_API_URL: URL the frontend uses to call the backend inside the container (default in ecosystem is http://localhost:5000)

Runtime env you likely need to set on Railway:
- PORT=3000 (frontend)
- BACKEND_PORT=5000
- OPENAI_API_KEY=... (optional moderation)
- GOOGLE_APPLICATION_CREDENTIALS=/app/vision-key.json (if using Vision)
- Any database secrets (DATABASE_URL, JWT_SECRET, etc.)

Container ports:
- Exposes 3000. Backend listens on 5000 internally in the same container.

Commands executed in container:
- PM2 starts two processes: `backend/server.js` and `demedia/server.js` (Next standalone output).


