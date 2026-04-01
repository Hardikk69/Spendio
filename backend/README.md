# Spendio Backend — Flask + PostgreSQL

A production-ready REST API backend for the Spendio subscription management app.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example and update your DB credentials:
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL password in `DATABASE_URL`.

### 3. Create PostgreSQL Database

```sql
-- In psql or pgAdmin:
CREATE DATABASE spendio;
```

### 4. Run Database Migrations

```bash
cd backend
flask db init       # Only first time
flask db migrate -m "Initial schema"
flask db upgrade
```

### 5. Seed Sample Data

```bash
python seed.py
```

This creates:
- `admin@spendio.in` / `Admin@1234` (admin role)
- `rajesh@example.com` / `Test@1234` (user — matches frontend mock data)
- `sarah@example.com` / `Test@1234` (user)

### 6. Start the Server

```bash
python run.py
# Server runs on http://localhost:5000
```

---

## API Endpoints

| Module | Prefix | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, profile, password |
| Subscriptions | `/api/subscriptions` | CRUD + stats, autopay, toggle |
| Billing | `/api/billing` | Transactions, upcoming bills, stats |
| Shared | `/api/shared` | Shared plans, invitations |
| Analytics | `/api/analytics` | Charts data, spending trends |
| Settings | `/api/settings` | Notifications, payment prefs |
| Admin | `/api/admin` | User management, dashboard |
| Health | `/api/health` | DB connectivity check |

### Quick Test
```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","password":"Test@1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh@example.com","password":"Test@1234"}'
```

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── config.py            # Dev/prod config
│   ├── extensions.py        # Flask extensions
│   ├── errors.py            # Error handlers
│   ├── models/              # SQLAlchemy models (8 models)
│   └── routes/              # Blueprint route handlers (7 modules)
├── migrations/              # Flask-Migrate auto-generated
├── seed.py                  # Sample data seeder
├── run.py                   # Entry point
├── requirements.txt
└── .env
```
