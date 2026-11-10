# CampusGuide AI

CampusGuide AI answers questions using a reference PDF and Gemini. The React
client sends requests to an Express backend; the Gemini API key stays on the
server.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your real API key.
   Keep the key private and do not commit `.env`.
3. Keep `GEMINI_MODEL=gemini-3.5-flash-lite`. For local PDF mode, leave
   `PDF_SOURCE_URL` blank and put your approved PDF at
   `documents/campus-handbook.pdf`. For online mode, set `PDF_SOURCE_URL` to a
   direct, publicly accessible HTTPS PDF URL.

## Run

Start the backend and frontend in separate terminals:

```sh
npm run server
```

```sh
npm run dev
```

The Vite development server proxies `/api` requests to Express on port 3001.
Check backend status at `http://127.0.0.1:3001/api/health`.

In the chat header, use **Instructions** to choose between the built-in system
prompt and `src/knowledge-base.txt`. The selected text is sent as Gemini's
system instruction; the configured PDF remains attached as reference material.
