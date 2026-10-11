# FleetRipple AI

> **Intelligent Fleet Recovery, Passenger Reallocation, and Cross-Company Trip Consolidation**  
> *A high-resilience transportation operations platform and operator-to-operator brokerage engine.*

---

## 1. Project Overview

**FleetRipple AI** is a dual-engine transportation operations platform designed for intercity coach networks. It addresses two pervasive, high-cost operational challenges in the bus transportation industry:
1. **Unplanned Service Disruptions (Vehicle Breakdowns):** When an active service experiences mechanical failure en route or before departure, stranding passengers.
2. **Low-Occupancy Service Inefficiencies (Empty Seat Run Costs):** When parallel competing operators run near-empty buses on identical highway corridors, resulting in wasted fuel, excess carbon emissions, and operating losses.

FleetRipple AI acts as a central operational intelligence and neutral B2B brokerage hub that coordinates multi-vehicle passenger reallocation, bilateral operator agreements, passenger consent ledgers, and automated financial settlements.

---

## 2. Core Operational Modules

### Module A: RippleOps AI (Breakdown Recovery & Passenger Reallocation)
When a bus experiences a mechanical breakdown (e.g. `BUS-101` on Visakhapatnam ↔ Vijayawada NH-16 corridor with 35 passengers onboard):
- **Diagnostic Ingestion:** Captures incident telemetry (breakdown location, passenger count, luggage volume, direction, time).
- **Candidate Fleet Discovery:** Evaluates candidate buses within corridor proximity based on hard operational constraints:
  - Route and direction compatibility.
  - Spare seating capacity.
  - Departure and arrival timing tolerances (maximum delay impact threshold).
  - Passenger group preservation constraints.
- **Constraint Optimization Engine:** Uses **Google OR-Tools** (Linear/Integer Programming solver) to compute an optimal multi-vehicle allocation plan (e.g. allocating 25 passengers to `BUS-102` and 10 passengers to `BUS-103`).
- **Passenger Offer Dispatch & Consent:** Dispatches real-time re-accommodation offers directly to passengers with choice to Accept, Wait for backup, or Request an immediate full refund.
- **Manifest Reconciliation:** Reconciles actual passenger boarding decisions and prevents closing the incident until 100% of stranded passengers are safely accounted for.

### Module B: TripMerge Guardian (Cross-Company Trip Consolidation)
When independent private operators run underbooked buses on parallel schedules (e.g. `TRIP-201` by Apex Express with 12 passengers and `TRIP-202` by Coastal Cruiser with 15 passengers):
- **Corridor Discovery:** Identifies overlapping low-occupancy departures (<50% load factor) within a 30-minute departure window.
- **Merge Proposal Generation:** Evaluates consolidating all passengers onto a single higher-capacity coach (`BUS-202` with 40 seats), canceling the redundant empty run.
- **B2B Commercial Negotiation:** Simulates a structured B2B brokerage workflow between independent operators with transparent unit economics:
  - Operating expense saved by canceling the empty bus (fuel, toll, wear).
  - Transfer compensation paid from Operator A (Apex) to Operator B (Coastal).
  - Platform brokerage commission fee.
  - Mutual contract acceptance, revision requests, or counter-proposals.
- **Passenger Consent Ledger & Viability Threshold:** Requires affirmative passenger acceptance with guaranteed refund rights. Enforces a **70% viability threshold** to prevent merge execution if passenger churn or refund requests render the consolidation unviable.
- **Execution & Ticket Reissue:** Formally re-issues unified digital boarding passes and logs financial ledger settlements.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Language:** JavaScript (ES6+ with modern JSX)
- **Styling:** Tailwind CSS with custom Linear/Stripe-inspired enterprise typography and design tokens
- **Data Visualization:** Recharts (responsive corridor occupancy comparison and consent distribution charts)
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (Python 3.10+) with Uvicorn ASGI server
- **Constraint Solver:** Google OR-Tools (`ortools.linear_solver.pywraplp`)
- **Database / ORM:** SQLite with SQLAlchemy 2.0 and Pydantic v2 schemas
- **Architecture:** RESTful API with automated database schema migration, seed lifecycle management, and end-to-end audit logging

---

## 4. Project Directory Structure

```text
fleetripple-ai/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI router endpoints
│   │   │   ├── analytics.py      # KPI metrics, corridor trends, audit trail
│   │   │   ├── bookings.py       # Passenger booking manifests
│   │   │   ├── consolidation.py  # TripMerge brokerage proposals & negotiations
│   │   │   ├── dashboard.py      # Central operations command centre metrics
│   │   │   ├── demo.py           # Demonstration state reset and batch runners
│   │   │   ├── health.py         # System health check endpoint
│   │   │   ├── incidents.py      # RippleOps breakdown incident workflows
│   │   │   ├── operators.py      # Bus operator profiles and commercial terms
│   │   │   ├── passenger_offers.py # Passenger re-accommodation offers
│   │   │   ├── refunds.py        # Automated refund processing
│   │   │   ├── trips.py          # Scheduled trips and corridor timetables
│   │   │   └── vehicles.py       # Fleet registry and live bus statuses
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── optimization/         # Google OR-Tools constraint engines
│   │   │   ├── consolidation_optimizer.py
│   │   │   └── recovery_optimizer.py
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── seed/                 # Demonstration operational seed data
│   │   ├── services/             # Core business logic services
│   │   ├── config.py             # Application settings & environment config
│   │   ├── database.py           # Engine & SessionLocal setup
│   │   └── main.py               # FastAPI entry point & lifespan handler
│   ├── tests/                    # Pytest test suite (27 tests)
│   │   ├── conftest.py
│   │   ├── test_consolidation.py
│   │   ├── test_health.py
│   │   ├── test_integration.py
│   │   └── test_recovery.py
│   └── requirements.txt          # Python package dependencies
├── public/                       # Static public assets and SVG icons
├── src/
│   ├── assets/                   # Vector graphics & illustration assets
│   ├── components/
│   │   ├── analytics/            # Analytics dashboard & chronological audit trail
│   │   ├── common/               # Reusable UI primitives (Badge, StatCard, Modal, etc.)
│   │   ├── fleet/                # Live fleet directory & vehicle drawer
│   │   ├── layout/               # Header, Sidebar, QuickDemoBar, AuditDrawer
│   │   ├── overview/             # Command Centre operations overview
│   │   ├── passenger/            # Passenger communications & mobile portal
│   │   ├── rippleops/            # RippleOps 5-stage breakdown recovery workspace
│   │   └── tripmerge/            # TripMerge 6-stage consolidation workspace
│   ├── context/                  # FleetRippleContext global state management
│   ├── data/                     # Baseline mock datasets & corridor definitions
│   ├── services/                 # Frontend API client service
│   ├── utils/                    # Currency and date/time formatters
│   ├── App.jsx                   # Application root router
│   ├── index.css                 # Global styles & typography utility classes
│   └── main.jsx                  # React DOM entry point
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git exclusion rules
├── package.json                  # Frontend dependencies and npm scripts
├── vite.config.js                # Vite build and proxy configuration
└── README.md                     # Platform documentation
```

---

## 5. Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Python:** v3.10 or higher
- **pip:** Latest version

---

## 6. Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/nishanthxvarma/fleetripple-ai.git
cd fleetripple-ai
```

### Step 2: Backend Setup
1. Open a terminal in the project root directory.
2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend will automatically create `fleetripple.db` and seed the operational dataset upon startup.*
   - **Interactive API Documentation (Swagger):** `http://127.0.0.1:8000/docs`
   - **Health Check:** `http://127.0.0.1:8000/api/health`

### Step 3: Frontend Setup
1. In a second terminal in the project root directory:
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser:
   ```text
   http://localhost:5173/
   ```

---

## 7. Environment Variables Configuration

Copy `.env.example` to `.env` if custom configuration is desired:

```ini
# API Base URL (proxied through Vite in development)
VITE_API_BASE_URL=/api

# Database connection URL
DATABASE_URL=sqlite:///./fleetripple.db
```

---

## 8. Running Tests & Verification

### Backend Pytest Suite
Run the full backend test suite covering health, recovery optimization, consolidation workflows, and integration scenarios:
```bash
python -m pytest backend/tests -v
```
*(All 27 automated tests pass covering constraint validation, operator approvals, passenger consent thresholds, and refund reconciliation).*

### Frontend Production Build
Validate the client production bundle and syntax:
```bash
npm run build
```

---

## 9. Current Prototype Boundaries & Simulated Functionality

To provide full transparency on what is live code vs. demonstration simulation:

| Feature Area | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Constraint Optimization** | **Real (OR-Tools)** | Google OR-Tools solver runs real mixed-integer programs for multi-vehicle passenger assignment. |
| **Database Persistence** | **Real (SQLAlchemy/SQLite)** | Incidents, proposals, assignments, consents, and audit logs persist to SQLite. |
| **REST API** | **Real (FastAPI)** | Fully functional CRUD endpoints with input validation and HTTP error handling. |
| **GPS Vehicle Tracking** | **Simulated** | Bus coordinates along the NH-16 corridor are pre-configured operational coordinates. |
| **SMS / WhatsApp Delivery** | **Simulated** | Passenger notifications and one-click responses are modeled through the in-app Passenger Communications Portal. |
| **Payment Gateway** | **Simulated** | Passenger ticket refunds and B2B operator transfer fees compute real financial ledger balances without external payment gateways (e.g. Stripe, Razorpay). |
| **Multi-Company Networks** | **Simulated Workflow** | Inter-operator commercial negotiation is implemented as a multi-party state machine simulation between Apex Express and Coastal Cruiser. |

---

## 10. License

This project was built for demonstration and evaluation purposes. All rights reserved.
