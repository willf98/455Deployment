# Cursor Script — Chapter 17 Part 1: Full-Stack Shop App (ASP.NET + React + SQLite)

---

## CONTEXT & GOAL

You are building a complete full-stack web application for a university assignment on deploying ML pipelines. The app uses a SQLite database file called `shop.db`. You will build the backend with **ASP.NET Core Web API (.NET 10)** and the frontend with **React + TypeScript + Vite + Bootstrap 5**.

Use the following project as your structural reference model — mirror its folder layout, naming conventions, and patterns exactly:

```
Reference project structure (WaterProject):
backend/
  WaterProject.API/
    Controllers/WaterController.cs      ← one controller per domain
    Data/WaterDbContext.cs              ← EF Core DbContext
    Data/Project.cs                     ← model class
    Program.cs                          ← minimal API setup, CORS, EF registration
    appsettings.json                    ← connection string
    WaterProject.API.csproj
    WaterProject.API.sln
frontend/
  src/
    types/Project.ts                    ← TypeScript interfaces
    App.tsx                             ← root component with layout
    ProjectLists.tsx                    ← paginated list component
    CategoryFilter.tsx                  ← sidebar filter component
    main.tsx
  package.json
  vite.config.ts
  index.html
```

---

## TECH STACK

- **Backend:** ASP.NET Core Web API, .NET 10, Entity Framework Core, Microsoft.EntityFrameworkCore.Sqlite
- **Frontend:** React 19, TypeScript, Vite, Bootstrap 5
- **Database:** SQLite — the existing file `shop.db` placed at the project root of `backend/ShopProject.API/`
- **Deployment:** Frontend → Vercel. Backend → Railway (or Render). *(Supabase migration comes later — do NOT set that up now.)*

---

## PROJECT FOLDER NAME

Name the project `ShopProject`. Create this folder structure:

```
ShopProject/
  backend/
    ShopProject.API/
      shop.db                ← copy of the SQLite database file goes here
      (ASP.NET solution here)
  frontend/
    (Vite React app here)
  jobs/
    run_inference.py         ← Python inference script (placeholder for now)
```

---

## DATABASE SCHEMA

The SQLite file `shop.db` already has all the tables below. Do NOT run any migrations or modify the existing tables — read from and write to them as-is using EF Core with `HasColumnName` mapping. Use these exact column names in your EF Core models:

### customers
| Column | Type |
|---|---|
| customer_id | int (PK) |
| full_name | text (required) |
| email | text (required) |
| gender | text |
| birthdate | text |
| created_at | text |
| city | text |
| state | text |
| zip_code | text |
| customer_segment | text |
| loyalty_tier | text |
| is_active | int (default 1) |

### products
| Column | Type |
|---|---|
| product_id | int (PK) |
| sku | text (required) |
| product_name | text (required) |
| category | text (required) |
| price | double (required) |
| cost | double (required) |
| is_active | int (default 1) |

### orders
| Column | Type |
|---|---|
| order_id | int (PK) |
| customer_id | int (required) |
| order_datetime | text (required) |
| billing_zip | text |
| shipping_zip | text |
| shipping_state | text |
| payment_method | text (required) |
| device_type | text (required) |
| ip_country | text (required) |
| promo_used | int (default 0) |
| promo_code | text |
| order_subtotal | double (required) |
| shipping_fee | double (required) |
| tax_amount | double (required) |
| order_total | double (required) |
| risk_score | double (required) |
| is_fraud | int (default 0) |

### order_items
| Column | Type |
|---|---|
| order_item_id | int (PK) |
| order_id | int (required) |
| product_id | int (required) |
| quantity | int (required) |
| unit_price | double (required) |
| line_total | double (required) |

### shipments
| Column | Type |
|---|---|
| shipment_id | int (PK) |
| order_id | int (required) |
| ship_datetime | text |
| carrier | text (required) |
| shipping_method | text (required) |
| distance_band | text (required) |
| promised_days | int (required) |
| actual_days | int (required) |
| late_delivery | int (default 0) |

### order_predictions
| Column | Type | Notes |
|---|---|---|
| order_id | int (PK) | |
| late_delivery_probability | double | |
| predicted_late_delivery | int | 0 or 1 |
| prediction_timestamp | text | ISO datetime string |

> **This table may not exist yet.** Create it using EF Core or a raw `CREATE TABLE IF NOT EXISTS` command on startup. The ML inference job writes into it; the app reads from it.

---

## BACKEND — ASP.NET CORE WEB API

### Setup

1. Create a new ASP.NET Core Web API solution at `backend/ShopProject.API/`.
2. Add these NuGet packages (same as the WaterProject reference):
   - `Microsoft.EntityFrameworkCore` (10.*)
   - `Microsoft.EntityFrameworkCore.Design` (10.*)
   - `Microsoft.EntityFrameworkCore.Sqlite` (10.*)
   - `Microsoft.AspNetCore.OpenApi` (10.*)

3. In `appsettings.json`, add:
```json
{
  "ConnectionStrings": {
    "ShopConnection": "Data Source=shop.db"
  }
}
```

4. Place `shop.db` inside `backend/ShopProject.API/` so the relative path resolves at runtime.

### Models (in `Data/`)

Create a C# model class for each table, following the WaterProject `Project.cs` pattern exactly:
- Use `[Key]` on primary key properties
- Use `[Required]` on required fields
- Use nullable `string?` on optional text fields
- Use `int?` or `double?` on optional numeric fields
- Since EF Core SQLite doesn't auto-map snake_case, use `[Column("column_name")]` on every property to map C# PascalCase names to the snake_case SQLite column names

Example pattern (mirror this for every model):
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopProject.API.Data
{
    [Table("customers")]
    public class Customer
    {
        [Key]
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Required]
        [Column("full_name")]
        public string FullName { get; set; }

        [Column("email")]
        [Required]
        public string Email { get; set; }

        [Column("city")]
        public string? City { get; set; }

        // ... etc for all columns
    }
}
```

Create `ShopDbContext.cs` that inherits `DbContext` with a `DbSet<T>` for each model:
```csharp
public DbSet<Customer> Customers { get; set; }
public DbSet<Product> Products { get; set; }
public DbSet<Order> Orders { get; set; }
public DbSet<OrderItem> OrderItems { get; set; }
public DbSet<Shipment> Shipments { get; set; }
public DbSet<OrderPrediction> OrderPredictions { get; set; }
```

Also override `OnModelCreating` to ensure `order_predictions` table is created if it doesn't exist:
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<OrderPrediction>().ToTable("order_predictions");
    // map all other entities too
}
```

In `Program.cs`:
- Register `ShopDbContext` with the SQLite provider using `"ShopConnection"` (same pattern as WaterProject)
- Enable `AddControllers()`
- Add CORS to allow `http://localhost:3000` and `http://localhost:5173`
- On startup, run the following raw SQL to create `order_predictions` if it doesn't exist — do NOT call `EnsureCreated()` (that would try to recreate all tables and break the existing data):
```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
    db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS order_predictions (
            order_id INTEGER PRIMARY KEY,
            late_delivery_probability REAL,
            predicted_late_delivery INTEGER,
            prediction_timestamp TEXT
        )
    ");
}
```
- Call `app.UseCors(...)`, `app.MapControllers()`, `app.UseHttpsRedirection()`

### Controllers

Create one controller per feature area, following the WaterProject `[Route("[controller]")]` `[ApiController]` pattern:

---

#### `CustomersController.cs`

```
GET /Customers/Search?query={text}
  - Query customers where full_name LIKE %query% OR email LIKE %query%
  - Return: customer_id, full_name, email, city, state, loyalty_tier
  - Limit 20 results

GET /Customers/{customerId}/Dashboard
  - Return a single object:
    {
      customer: { customerId, fullName, email, city, state, loyaltyTier },
      totalOrders: int,
      totalSpend: double,
      recentOrders: [ { orderId, orderDatetime, orderTotal, isShipped: bool } ] (last 5)
    }
  - isShipped = true if a shipment record exists for that order_id
  - Use .Include() or a LINQ left join to check shipments
```

---

#### `ProductsController.cs`

```
GET /Products/Active
  - Return all products where is_active = 1
  - Fields: productId, productName, category, price
```

---

#### `OrdersController.cs`

```
GET /Orders/Customer/{customerId}
  - Return all orders for this customer, most recent first
  - Include isShipped bool (check if a shipment row exists for each order_id)
  - Fields: orderId, orderDatetime, orderTotal, isShipped

GET /Orders/{orderId}/Items
  - Return order header + line items joined with product name
  - Header: orderId, orderDatetime, orderTotal, paymentMethod
  - Items: [ { productName, quantity, unitPrice, lineTotal } ]

POST /Orders/Place
  Body: {
    customerId: int,
    paymentMethod: string,
    items: [ { productId: int, quantity: int } ]
  }
  - Open a DB transaction
  - Look up each product price from the products table
  - Compute line_total = quantity * unit_price per item
  - Compute order_subtotal = sum of all line_totals
  - Set shipping_fee = 9.99 (flat)
  - Set tax_amount = order_subtotal * 0.08
  - Set order_total = order_subtotal + shipping_fee + tax_amount
  - Set order_datetime = DateTime.UtcNow.ToString("o")
  - Set device_type = "web", ip_country = "US", risk_score = 0.0, is_fraud = 0
  - Insert the order row, then insert all order_item rows
  - Commit transaction
  - Return: { success: true, orderId: int }
```

---

#### `WarehouseController.cs`

```
GET /Warehouse/PriorityQueue
  - Execute this raw SQL query using context.Database.SqlQueryRaw or FromSqlRaw:

    SELECT o.order_id, o.order_datetime, o.order_total,
           c.customer_id, c.full_name AS customer_name,
           p.late_delivery_probability, p.predicted_late_delivery, p.prediction_timestamp
    FROM orders o
    JOIN customers c ON c.customer_id = o.customer_id
    JOIN order_predictions p ON p.order_id = o.order_id
    LEFT JOIN shipments s ON s.order_id = o.order_id
    WHERE s.shipment_id IS NULL
    ORDER BY p.late_delivery_probability DESC, o.order_datetime ASC
    LIMIT 50

  - Map result into a DTO and return as JSON array
  - If order_predictions is empty, return an empty array (do NOT error)
```

---

#### `ScoringController.cs`

Replace the entire controller with this exact implementation:

```csharp
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace ShopProject.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ScoringController : ControllerBase
    {
        [HttpPost("Run")]
        public IActionResult RunScoring()
        {
            try
            {
                // Resolve the jobs/ folder relative to the solution root.
                // AppContext.BaseDirectory is bin/Debug/net10.0 — go up 4 levels to reach ShopProject/
                var baseDir = AppContext.BaseDirectory;
                var projectRoot = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", ".."));
                var scriptPath = Path.Combine(projectRoot, "jobs", "run_inference.py");

                if (!System.IO.File.Exists(scriptPath))
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Inference script not yet built. Add jobs/run_inference.py to enable scoring.",
                        timestamp = DateTime.UtcNow.ToString("o")
                    });
                }

                // Try "python" first, fall back to "python3"
                foreach (var pythonExe in new[] { "python", "python3" })
                {
                    try
                    {
                        var psi = new ProcessStartInfo
                        {
                            FileName = pythonExe,
                            // Quote the script path to handle spaces in usernames/paths
                            Arguments = $"\"{scriptPath}\"",
                            WorkingDirectory = projectRoot,
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            UseShellExecute = false,
                            CreateNoWindow = true
                        };

                        using var process = new Process { StartInfo = psi };
                        process.Start();

                        var stdout = process.StandardOutput.ReadToEnd();
                        var stderr = process.StandardError.ReadToEnd();
                        bool finished = process.WaitForExit(30000); // 30-second timeout

                        if (!finished)
                        {
                            process.Kill();
                            return Ok(new
                            {
                                success = false,
                                message = "Scoring script timed out after 30 seconds.",
                                timestamp = DateTime.UtcNow.ToString("o")
                            });
                        }

                        bool succeeded = process.ExitCode == 0;
                        return Ok(new
                        {
                            success = succeeded,
                            message = succeeded
                                ? (string.IsNullOrWhiteSpace(stdout) ? "Scoring completed." : stdout.Trim())
                                : $"Script error: {stderr.Trim()}",
                            timestamp = DateTime.UtcNow.ToString("o")
                        });
                    }
                    catch (System.ComponentModel.Win32Exception)
                    {
                        // This python executable wasn't found — try the next one
                        continue;
                    }
                }

                return Ok(new
                {
                    success = false,
                    message = "Python not found. Make sure Python is installed and on your PATH.",
                    timestamp = DateTime.UtcNow.ToString("o")
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = $"Unexpected error: {ex.Message}",
                    timestamp = DateTime.UtcNow.ToString("o")
                });
            }
        }
    }
}
```

---

## FRONTEND — REACT + TYPESCRIPT + VITE

### Setup

1. Create a new Vite React TypeScript app at `frontend/`:
   ```
   npm create vite@latest frontend -- --template react-ts
   ```
2. Install dependencies:
   ```
   npm install bootstrap react-router-dom
   npm install --save-dev @types/react-router-dom
   ```
3. In `main.tsx`, import Bootstrap:
   ```ts
   import 'bootstrap/dist/css/bootstrap.min.css'
   ```

### TypeScript Types (`src/types/`)

```ts
// Customer.ts
export interface Customer {
  customerId: number;
  fullName: string;
  email: string;
  city?: string;
  state?: string;
  loyaltyTier?: string;
}

// DashboardData.ts
export interface DashboardData {
  customer: Customer;
  totalOrders: number;
  totalSpend: number;
  recentOrders: RecentOrder[];
}
export interface RecentOrder {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  isShipped: boolean;
}

// Product.ts
export interface Product {
  productId: number;
  productName: string;
  category: string;
  price: number;
}

// Order.ts
export interface Order {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  isShipped: boolean;
}
export interface OrderDetail {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  paymentMethod: string;
  items: OrderItem[];
}
export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// PriorityQueue.ts
export interface PriorityQueueItem {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  customerId: number;
  customerName: string;
  lateDeliveryProbability: number;
  predictedLateDelivery: number;
  predictionTimestamp: string;
}
```

### App Structure

Use `react-router-dom` (`BrowserRouter`) with these routes in `App.tsx`:

```
/                        → redirect to /select-customer
/select-customer         → SelectCustomer page
/dashboard               → Dashboard page
/place-order             → PlaceOrder page
/orders                  → OrderHistory page
/orders/:orderId         → OrderDetail page
/warehouse/priority      → WarehousePriority page
/scoring                 → RunScoring page
```

Add a **persistent Bootstrap navbar** at the top with links to all pages. Include a small badge/text showing the currently selected customer name (read from `localStorage`). If no customer is selected, show "No customer selected."

Store `selectedCustomerId` (number) and `selectedCustomerName` (string) in `localStorage` when a customer is chosen.

---

### Pages

#### `/select-customer` — SelectCustomer.tsx

- Text input: search by name or email
- On each keystroke (debounced 300ms), call `GET /Customers/Search?query=...`
- Render results as a Bootstrap `list-group`
- Each result shows: full name + email
- On click: save to `localStorage`, navigate to `/dashboard`

---

#### `/dashboard` — Dashboard.tsx

- On mount: if no `selectedCustomerId` in localStorage, redirect to `/select-customer`
- Fetch `GET /Customers/{customerId}/Dashboard`
- Layout (Bootstrap grid):
  - **Card 1 — Customer Info:** name, email, city, state, loyalty tier
  - **Card 2 — Stats:** Total orders (integer), Total spend (formatted `$X,XXX.XX`)
  - **Card 3 — Recent Orders:** Bootstrap table with Order ID, Date, Total, Shipped (✅ or ⏳)

---

#### `/place-order` — PlaceOrder.tsx

- On mount: if no customer, redirect to `/select-customer`
- Fetch `GET /Products/Active` on load
- Dynamic line items: start with one row, each has:
  - `<select>` for product (populated from products list)
  - `<input type="number">` for quantity (min 1)
- "Add Item" button appends a new row
- "Remove" button on each row
- Running total shown below the items (computed on the frontend)
- "Place Order" submit button:
  - POST to `/Orders/Place`
  - Show success message with order ID on success
  - On success: navigate to `/orders`
  - On error: show red Bootstrap alert

---

#### `/orders` — OrderHistory.tsx

- On mount: if no customer, redirect to `/select-customer`
- Fetch `GET /Orders/Customer/{customerId}`
- Bootstrap table: Order ID | Date | Total | Shipped
- Each row is clickable → navigate to `/orders/{orderId}`

---

#### `/orders/:orderId` — OrderDetail.tsx

- Fetch `GET /Orders/{orderId}/Items`
- Show order header section: Order #, Date, Total, Payment Method
- Bootstrap table for line items: Product | Qty | Unit Price | Line Total

---

#### `/warehouse/priority` — WarehousePriority.tsx

- Fetch `GET /Warehouse/PriorityQueue`
- Page title: "Late Delivery Priority Queue"
- Explanatory paragraph: "These unshipped orders are ranked by predicted late-delivery probability. Process the top entries first."
- Bootstrap table: Order ID | Customer | Order Date | Total | Late Delivery % | Predicted Late | Scored At
- Format probability as `87.3%`
- If the array is empty, show: "No predictions yet — use the Run Scoring page to generate predictions."

---

#### `/scoring` — RunScoring.tsx

- Full-width Bootstrap primary button: "Run Scoring"
- On click: POST to `/Scoring/Run`, show spinner while waiting
- On success: green Bootstrap alert with the message returned + timestamp
- On failure: red Bootstrap alert with error message
- After success: show a "View Priority Queue →" link to `/warehouse/priority`

---

## VITE PROXY CONFIG

In `vite.config.ts`, proxy `/api` to the backend so there are no CORS issues in development:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

Prefix every `fetch()` call in the frontend with `/api/` (e.g., `fetch('/api/Customers/Search?query=...')`).

---

## DEPLOYMENT CHECKLIST

> **Note: Supabase migration is a future step — do NOT set it up now. Build and test locally with SQLite first.**

### Frontend → Vercel
1. Push repo to GitHub
2. Import into Vercel, set root directory to `frontend/`
3. Build command: `npm run build`, output dir: `dist`
4. Add env var `VITE_API_URL=https://your-backend.railway.app`
5. Update all fetch calls to use `import.meta.env.VITE_API_URL` as base (only needed for production)

### Backend → Railway (recommended)
1. Connect repo to Railway, set root to `backend/ShopProject.API/`
2. Railway auto-detects .NET and runs `dotnet run`
3. Upload `shop.db` as a volume or include it in the repo (for now)

### CORS Update for Production
In `Program.cs`, add your Vercel domain alongside localhost:
```csharp
app.UseCors(x => x.WithOrigins(
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-app.vercel.app"
).AllowAnyHeader().AllowAnyMethod());
```

---

## DELIVERABLES CHECKLIST

- [ ] Select Customer screen — search + set active customer
- [ ] Customer Dashboard — stats + recent orders
- [ ] Place Order — dynamic line items, DB transaction, success redirect
- [ ] Order History — table with shipped indicator, clickable rows
- [ ] Order Detail — line items with product names
- [ ] Warehouse Priority Queue — top 50 by late delivery probability
- [ ] Run Scoring — triggers Python script, shows result
- [ ] Deployed frontend URL on Vercel
- [ ] README.md with local setup steps and run commands

---

## PLACEHOLDER INFERENCE SCRIPT

Create `jobs/run_inference.py` at the project root with this content. It is a placeholder — the real ML model gets wired in later:

```python
# jobs/run_inference.py
# Placeholder inference script for Chapter 17 assignment.
# Replace with the real ML pipeline once the model is trained.

import sqlite3
import os
from datetime import datetime, timezone

# Path to shop.db — resolve relative to this script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(SCRIPT_DIR, "backend", "ShopProject.API", "shop.db")

def ensure_predictions_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS order_predictions (
            order_id INTEGER PRIMARY KEY,
            late_delivery_probability REAL,
            predicted_late_delivery INTEGER,
            prediction_timestamp TEXT
        )
    """)
    conn.commit()

def run_inference():
    if not os.path.exists(DB_PATH):
        print(f"ERROR: shop.db not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    ensure_predictions_table(conn)

    # Get orders that don't have predictions yet
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.order_id FROM orders o
        LEFT JOIN order_predictions p ON p.order_id = o.order_id
        WHERE p.order_id IS NULL
        LIMIT 100
    """)
    order_ids = [row[0] for row in cursor.fetchall()]

    if not order_ids:
        print("No new orders to score.")
        conn.close()
        return

    # Placeholder: assign a dummy probability (replace with real model later)
    import random
    ts = datetime.now(timezone.utc).isoformat()
    rows = [
        (oid, round(random.uniform(0.3, 0.95), 4), 1, ts)
        for oid in order_ids
    ]

    conn.executemany("""
        INSERT OR REPLACE INTO order_predictions
        (order_id, late_delivery_probability, predicted_late_delivery, prediction_timestamp)
        VALUES (?, ?, ?, ?)
    """, rows)
    conn.commit()
    conn.close()

    print(f"Inference complete. Predictions written: {len(rows)}")

if __name__ == "__main__":
    run_inference()
```

> This placeholder assigns random probabilities so the Warehouse Priority Queue has data to display immediately. Swap in the real scikit-learn model once it is trained.

---

## HARD CONSTRAINTS

- Use **SQLite** with `Microsoft.EntityFrameworkCore.Sqlite` — do NOT use PostgreSQL or Npgsql
- The `shop.db` file already has all data — do NOT run EF migrations that would wipe or alter existing tables
- Do NOT invent new tables (except `order_predictions` which may need to be created)
- Do NOT add authentication — customer selection via picker only
- Bootstrap 5 only — no Tailwind, no Material UI, no other CSS frameworks
- Follow the WaterProject naming conventions for everything
- The backend must NOT crash if `jobs/run_inference.py` is missing

---

## FINAL INSTRUCTION TO CURSOR

Build everything described above. Place `shop.db` in `backend/ShopProject.API/`. After generating all files, provide:
1. Every command to run the app locally (`dotnet run` + `npm run dev`)
2. A `README.md` at the project root with full setup steps
3. Confirmation that `shop.db` is read-only (existing data preserved) and only `order_predictions` is created new
