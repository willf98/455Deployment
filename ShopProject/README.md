# ShopProject — Full-Stack Shop App

ASP.NET Core Web API + React + SQLite  
University assignment: IS 455 — Chapter 17, Deploying ML Pipelines

---

## Project Structure

```
ShopProject/
  backend/
    ShopProject.API/
      shop.db                 ← SQLite database (existing data preserved)
      Data/                   ← EF Core models + DbContext
      Controllers/            ← API controllers
      Program.cs
      appsettings.json
      ShopProject.API.csproj
      ShopProject.API.sln
  frontend/
    src/
      types/                  ← TypeScript interfaces
      pages/                  ← React page components
      App.tsx                 ← Router + Navbar
      main.tsx
    vite.config.ts
    package.json
  jobs/
    run_inference.py          ← ML inference script (replace with real model)
  README.md
```

---

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Python 3.9+](https://www.python.org/) (for the inference job)

---

## Running Locally

### 1 — Backend

```bash
cd backend/ShopProject.API
dotnet run
```

The API starts on **http://localhost:5000**.  
`shop.db` is read from the project directory. Existing data is never modified — only the `order_predictions` table is created on first run (if it doesn't exist).

### 2 — Frontend

```bash
cd frontend
npm install        # first time only
npm run dev
```

The app starts on **http://localhost:3000**.  
All `/api/*` requests are proxied to `http://localhost:5000`.

### 3 — ML Inference (optional)

```bash
python jobs/run_inference.py
```

Scores unshipped orders and writes results to `order_predictions`. After running, refresh the Warehouse Priority Queue page.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/Customers/Search?query=` | Search customers by name or email |
| GET | `/Customers/{id}/Dashboard` | Customer stats + recent orders |
| GET | `/Products/Active` | All active products |
| GET | `/Orders/Customer/{id}` | Orders for a customer |
| GET | `/Orders/{id}/Items` | Order header + line items |
| POST | `/Orders/Place` | Place a new order |
| GET | `/Warehouse/PriorityQueue` | Top 50 high-risk unshipped orders |
| POST | `/Scoring/Run` | Trigger Python inference script |

---

## Database Notes

- `shop.db` already contains all seed data — **do not run EF migrations**.
- The `order_predictions` table is created automatically on startup if it does not exist.
- All other tables are read-only from EF Core's perspective.

---

## Deployment

### Frontend → Vercel

1. Push repo to GitHub
2. Import into Vercel, set root directory to `frontend/`
3. Build command: `npm run build` | Output: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.railway.app`
5. Update fetch calls to use `import.meta.env.VITE_API_URL` as the base URL

### Backend → Railway

1. Connect repo, set root to `backend/ShopProject.API/`
2. Railway auto-detects .NET and runs `dotnet run`
3. Include `shop.db` in the repo or mount it as a volume
4. Add your Vercel URL to the CORS `WithOrigins(...)` list in `Program.cs`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core Web API, .NET 9 |
| ORM | Entity Framework Core 9 + SQLite |
| Frontend | React 19, TypeScript, Vite |
| Styling | Bootstrap 5 |
| Database | SQLite (`shop.db`) |
| ML Script | Python 3 |
