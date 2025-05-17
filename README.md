# 🟨 CuriousHuman

A lightweight open-source Q&A platform where anonymous visitors can ask questions, and an admin manages and answers them from a private dashboard.

## 🧩 Project Structure

- `ask-frontend`: React-based user interface for visitors
- `ask-backend`: Node.js + Express API powered by PostgreSQL

## ⚙️ Requirements

- Node.js 18+
- PostgreSQL
- Linux server (or local machine)
- Optional: Cloudflare Tunnel for public access

## 🛠 Getting Started Locally

### Frontend

```bash
cd ask-frontend
npm install
npm start
```

### Backend

```bash
cd ask-backend
npm install
node index.js
```

## 🚀 Production Deployment

- Backend runs on port `3001`
- Frontend should be built via `npm run build` and served using `serve`, Nginx, or PM2

## 📌 Current Features

- Anonymous question submission
- Admin login with token storage
- View & answer incoming questions
- Hide or delete answered questions
- Restore and re-answer hidden questions
- RTL UI fully in Arabic

## 📦 Phase 2 (Future)

- User registration & login
- Personalized links `/user`
- Receive questions anonymously per user
- Admin moderation panel for user-generated profiles

---

Built with ❤️ by Fahad.
