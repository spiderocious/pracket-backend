# pracket-backend

REST API + Socket.io server for the Pracket tutor marketplace.

## Stack

Node.js · Express · TypeScript · MongoDB (Mongoose) · Socket.io · Nodemailer

## Getting started

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET at minimum
npm run dev            # http://localhost:8086
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled output |
| `npm run typecheck` | Type-check without emitting |

## Environment variables

See `.env.example`. Required at startup:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | At least 32 characters |

Everything else has a default that works locally.

## Project structure

```
src/
├── features/        # One folder per domain feature
│   ├── auth/
│   ├── tutors/
│   ├── search/
│   ├── shortlist/
│   ├── connections/
│   ├── messages/
│   ├── posts/
│   ├── reports/
│   └── admin/
├── lib/             # DB, JWT, logger, errors, mailer
├── middlewares/     # auth, validate, errorHandler
├── shared/          # Types and constants
├── socket/          # Socket.io setup and message handler
├── app.ts
├── server.ts
└── env.ts
```

## API

Full documentation: [`docs/api-docs.md`](../docs/api-docs.md)

Frontend integration guide: [`docs/frontend-handoff.md`](../docs/frontend-handoff.md)

## Auth

JWT Bearer token. Pass as `Authorization: Bearer <token>` on all protected endpoints. Token is returned from `POST /api/auth/register` and `POST /api/auth/login`.

## Real-time

Socket.io on the same port. Authenticate via handshake:

```js
const socket = io('http://localhost:8086', {
  auth: { token: '<jwt>' }
});
socket.emit('join_connection', connectionId);
socket.on('new_message', ({ data }) => { /* ... */ });
```
