# StockFlow — Docker & Deployment Guide

No Docker Desktop required. This guide uses **Colima** (free) locally and **free cloud hosts** for production.

---

## What you are building

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend   │────▶│  PostgreSQL  │
│  (React)    │     │  (FastAPI)  │     │  (database)  │
└─────────────┘     └─────────────┘     └──────────────┘
```

- **Docker** = packages each part into a container (like a lightweight mini-computer).
- **docker-compose** = starts all 3 containers with one command.
- **Deploy** = run those containers on the internet (Render, Vercel, etc.).

---

## PART A — Run with Docker on your Mac (Colima)

### Step A1 — Install Colima + Docker CLI (one time)

```bash
brew install colima docker docker-compose
```

### Step A2 — Start Colima

```bash
colima start --memory 4
```

Wait until it says "done". Verify:

```bash
docker ps
```

You should see an empty table (no error).

### Step A3 — Build and run the full app

From the project root:

```bash
cd "/Users/pratpuro/Desktop/Prats/Ethara AI"
docker compose up --build
```

First run takes a few minutes (downloads images + builds).

### Step A4 — Open the app

| What | URL |
|------|-----|
| **App (frontend)** | http://localhost:8080 |
| **API docs** | http://localhost:8000/docs |
| **Health check** | http://localhost:8000/health |

### Step A5 — Add sample data (optional)

In a **new terminal** while containers are running:

```bash
cd "/Users/pratpuro/Desktop/Prats/Ethara AI"
docker compose exec backend python seed.py --reset
```

Refresh http://localhost:8080/dashboard

### Step A6 — Stop containers

Press `Ctrl+C` in the terminal running `docker compose up`, then:

```bash
docker compose down
```

To also delete database data:

```bash
docker compose down -v
```

---

## PART B — Push backend image to Docker Hub

Docker Hub stores your backend image so others (and Render) can use it.

### Step B1 — Create a free Docker Hub account

https://hub.docker.com/signup

Remember your **username** (example: `dikshya0107`).

### Step B2 — Log in from terminal

```bash
docker login
```

Enter Docker Hub username + password (or access token).

### Step B3 — Build and tag the backend image

Replace `YOUR_DOCKERHUB_USERNAME` with your real username:

```bash
cd "/Users/pratpuro/Desktop/Prats/Ethara AI"

docker build -t YOUR_DOCKERHUB_USERNAME/stockflow-backend:latest ./backend
```

Example:

```bash
docker build -t dikshya0107/stockflow-backend:latest ./backend
```

### Step B4 — Push to Docker Hub

```bash
docker push YOUR_DOCKERHUB_USERNAME/stockflow-backend:latest
```

Your image URL will be:

`https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/stockflow-backend`

---

## PART C — Deploy online (free tiers)

Recommended combo (all free to start):

| Part | Platform | Why |
|------|----------|-----|
| Database | **Render PostgreSQL** or **Neon** | Free Postgres |
| Backend | **Render** | Runs Docker / Python easily |
| Frontend | **Vercel** | Free React hosting |

### Step C1 — Push code to GitHub

Make sure your repo is on GitHub:

https://github.com/Dikshya0107/StockFlow--Inventory-Order-Management-System

```bash
cd "/Users/pratpuro/Desktop/Prats/Ethara AI"
git add .
git commit -m "feat: add Docker and deployment config"
git push origin main
```

### Step C2 — Create a cloud database

**Option 1: Render PostgreSQL**

1. Go to https://render.com → Sign up (free)
2. **New +** → **PostgreSQL**
3. Name: `stockflow-db`, free plan
4. Copy the **Internal Database URL** (starts with `postgresql://`)

**Option 2: Neon** (https://neon.tech) — also free, copy connection string.

### Step C3 — Deploy backend on Render

1. Render dashboard → **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name:** `stockflow-api`
   - **Root Directory:** `backend`
   - **Runtime:** Docker *(or Python if Docker option not shown — use Dockerfile)*
   - **Instance type:** Free
4. **Environment variables:**

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *(paste Postgres URL from Step C2)* |
   | `CORS_ORIGINS` | `https://YOUR-VERCEL-APP.vercel.app` *(update after Step C4)* |
   | `PORT` | `8000` |

5. Click **Create Web Service**
6. Wait for deploy → copy your API URL (e.g. `https://stockflow-api.onrender.com`)

Test: `https://YOUR-API-URL.onrender.com/health`

### Step C4 — Deploy frontend on Vercel

1. Go to https://vercel.com → Sign up (free)
2. **Add New Project** → Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
4. **Environment variable:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://YOUR-API-URL.onrender.com` *(no trailing slash)* |

5. Deploy → copy frontend URL (e.g. `https://stockflow.vercel.app`)

### Step C5 — Connect frontend and backend

1. Go back to **Render** → your backend service → **Environment**
2. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
3. Save → Render will redeploy automatically

### Step C6 — Seed production data (optional)

On Render free tier you can use the **Shell** tab or run locally against production DB:

```bash
# Only if you have DATABASE_URL — be careful with production!
DATABASE_URL="postgresql://..." python backend/seed.py --reset
```

---

## PART D — Submission checklist

| Deliverable | Where to get it |
|-------------|-----------------|
| GitHub repo | https://github.com/Dikshya0107/StockFlow--Inventory-Order-Management-System |
| Docker Hub image | `https://hub.docker.com/r/YOUR_USERNAME/stockflow-backend` |
| Live frontend | Your Vercel URL |
| Live backend API | Your Render URL + `/docs` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to Docker daemon` | Run `colima start` |
| `port already in use` | Stop local servers: `lsof -ti:8000 \| xargs kill` |
| Network error in browser (Docker) | Use http://localhost:8080 (not 5173) |
| Network error (production) | Check `VITE_API_URL` on Vercel and `CORS_ORIGINS` on Render match |
| Render app sleeps (free tier) | First request after idle takes ~30s — normal on free plan |
| Database connection failed | Check `DATABASE_URL` uses the **external** URL if connecting from outside Render |

---

## Quick command reference

```bash
# Start Colima
colima start

# Run full stack locally
docker compose up --build

# Run in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Rebuild after code changes
docker compose up --build
```

---

## What each file does

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | How to build the API container |
| `frontend/Dockerfile` | Build React app + serve with nginx |
| `docker-compose.yml` | Runs db + backend + frontend together |
| `.env.docker.example` | Example environment variables |

**Important:** Never commit `.env` files with real passwords to GitHub.
