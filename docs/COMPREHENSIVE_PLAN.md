# COMPREHENSIVE PLAN: Priority Pass × Taxi App Integration
## Client Solutions Architect Technical Assignment

---

## TABLE OF CONTENTS

1. [Critical Design Principles](#critical-design-principles)
2. [Phase 1: Actors & User Flows](#phase-1-actors--user-flows)
3. [Phase 2: Data Flow Design](#phase-2-data-flow-design)
4. [Phase 3: API Gateway Assessment](#phase-3-api-gateway-assessment)
5. [Phase 4: Service Communication Pattern](#phase-4-service-communication-pattern)
6. [Phase 5: React UI Structure](#phase-5-react-ui-structure)
7. [Phase 6: C4 Diagrams Specification](#phase-6-c4-diagrams-specification)
8. [Phase 7: README Documentation](#phase-7-readme-documentation)
9. [Phase 8: Presentation Strategy](#phase-8-presentation-strategy)
10. [Final Checklist](#final-checklist)

---

## CRITICAL DESIGN PRINCIPLES

### Core Architectural Stance

1. **No Over-Engineering**: We're building for 100K users initially, not 100M
2. **Clear Actor Separation**: Users ≠ Managers ≠ Systems
3. **Justifiable Patterns**: Every architectural choice must have a defendable reason
4. **Progressive Zoom**: Each C4 level reveals meaningful internal detail

---

## PHASE 1: ACTORS & USER FLOWS
### MVP Actor Model

### 1.1 Core Actor Model

We have **3 primary actors** for the MVP:

**PRIMARY ACTORS:**
1. **Priority Pass Member (Traveler)**
   - Uses: PP app to view flights, book taxis, access lounges
   - Primary use case: Seamless airport journey planning

2. **Taxi App User (Non-PP Member)**
   - Uses: Taxi app for rides + sees PP lounge offers
   - Secondary benefit: Cross-promotion of Priority Pass services

3. **Taxi Driver**
   - Uses: Taxi Driver app to accept/decline rides, navigate
   - Receives booking requests from both PP and taxi platform users

**Why This Actor Model:**
- **MVP Focus**: Core user journey (traveler books taxi, driver fulfills)
- **Clear Value Proposition**: Demonstrates integration benefits without complexity
- **Scalable Foundation**: Additional actors (operations teams, support) can be added post-MVP

### 1.2 Primary User Flows (MVP)

**Flow 1: Priority Pass Member Books Taxi**
```
1. User opens Priority Pass app
2. Views upcoming flight (LHR departure at 14:30)
3. Sees recommended taxi pickup time (12:00) with timeline breakdown
4. Enters pickup address (home/hotel)
5. Reviews fare estimate with 10% PP member discount
6. Books taxi
7. Receives confirmation with driver details
8. Gets real-time status updates
```

**Flow 2: Taxi Driver Accepts Booking**
```
1. Driver sees new booking request in driver app
2. Views pickup location and airport destination
3. Sees "Priority Pass Member" badge (may influence acceptance)
4. Accepts booking
5. Navigates to pickup location
6. Completes journey
7. Receives payment (PP member discount already applied)
```

**Flow 3: Cross-Platform Inventory Sharing**
```
Scenario A: Taxi User Discovers PP
1. Regular taxi app user books airport ride
2. Sees promotional banner: "Access airport lounges with Priority Pass"
3. Views available lounges at destination airport
4. Option to sign up for PP membership

Scenario B: PP Member Uses Taxi Platform Directly
1. PP member downloads taxi app separately
2. Links PP account during onboarding
3. Automatically receives member discounts on airport routes
4. Booking history synced across both platforms
```

---

## PHASE 2: DATA FLOW DESIGN
### Addressing Feedback Point 2: Data Flow Depth

### 2.1 Complete Data Flow Architecture

**Design Philosophy:**
- **Unidirectional flow**: Data flows through clear pipelines, not spaghetti
- **Event-driven**: Systems react to events, not polling
- **Separation of concerns**: Read vs Write paths are distinct

---

#### Flow 1: Initial PP Member → Taxi Booking

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Initiates Booking                                  │
└─────────────────────────────────────────────────────────────────┘

PP Member clicks "Book Taxi" in Priority Pass app
         │
         ▼
┌─────────────────────────────────┐
│  Priority Pass Frontend (React) │
│  • Collects: pickup address     │
│  • Auto-fills: airport, terminal│
│  • Shows: estimated fare         │
└─────────────────────────────────┘
         │ POST /api/taxi/booking-request
         ▼
┌─────────────────────────────────┐
│  Integration Service            │  ◄─── THIS IS THE ORCHESTRATOR
│  (Node.js)                      │
│                                 │
│  → Validates user is PP member  │
│  → Checks flight exists         │
│  → Calculates recommended time  │
│  → Enriches request with:       │
│     • user_id (PP)              │
│     • membership_tier           │
│     • flight_context            │
└─────────────────────────────────┘
         │ POST /api/bookings (to Taxi Service)
         ▼
┌─────────────────────────────────┐
│  Taxi Booking Service           │
│  • Creates booking record       │
│  • Applies PP member discount   │
│  • Triggers driver assignment   │
└─────────────────────────────────┘
         │ EVENT: booking.created
         ▼
┌─────────────────────────────────┐
│  Event Bus (e.g., AWS EventBridge)
└─────────────────────────────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
    [Notification]  [Analytics]  [Audit Log]
     Service         Service      Service
```

**Justification for This Flow:**

1. **Why Integration Service sits in middle?**
   - PP Frontend shouldn't know Taxi Service API details (loose coupling)
   - Taxi Service shouldn't need to know PP business rules
   - Integration Service = "translation layer" + business logic

2. **Why Event Bus after booking creation?**
   - Multiple downstream systems need to react (notifications, analytics)
   - Asynchronous processing prevents blocking the user
   - Easy to add new listeners without changing Taxi Service

3. **Why enrichment happens in Integration Service?**
   - Taxi Service doesn't need direct access to PP database
   - Integration Service aggregates context from multiple sources
   - Single point for data mapping/transformation

---

#### Flow 2: Driver Accepts Ride → Notify PP Member

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Driver Assignment & Tracking                            │
└─────────────────────────────────────────────────────────────────┘

Driver sees ride request in Taxi Driver app
Driver accepts ride
         │
         ▼
┌─────────────────────────────────┐
│  Taxi Driver Service            │
│  • Updates booking status       │
│  • Emits event                  │
└─────────────────────────────────┘
         │ EVENT: driver.assigned
         ▼
┌─────────────────────────────────┐
│  Event Bus                      │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│ Integration     │
│ Service         │
│ (Listens)       │
└─────────────────┘
        │
        │ Translates event
        │ for PP context
        ▼
┌─────────────────┐
│ Notification    │
│ Service         │
└─────────────────┘
        │
        ▼ Push notification
    PP Member receives:
    "Your driver John is 5 mins away"
```

**Key Data Transformations:**

**At Taxi Driver Service (Internal Format):**
```javascript
{
  "event_type": "driver.assigned",
  "booking_id": "TXI_12345",
  "driver_id": "DRV_789",
  "pickup_eta_seconds": 300,
  "vehicle": {
    "make": "Tesla",
    "model": "Model 3",
    "license": "ABC123"
  }
}
```

**After Integration Service Enrichment:**
```javascript
{
  "event_type": "taxi.driver_assigned",
  "user_id": "pp_member_456",  // ← Added from PP context
  "booking_id": "TXI_12345",
  "driver_name": "John",  // ← Masked last name for privacy
  "pickup_eta_mins": 5,  // ← Converted from seconds
  "vehicle_display": "Black Tesla Model 3",  // ← Formatted
  "tracking_url": "https://pp.app/track/TXI_12345",  // ← Generated
  "flight_context": {  // ← Added for context
    "departure_time": "14:30",
    "recommended_departure": "12:00",
    "time_remaining": "45 mins to recommended departure"
  }
}
```

**Justification:**
- **Why not send Taxi Service data directly to PP app?**
  - Data formats differ (taxi uses seconds, PP shows minutes)
  - PP app needs flight context, Taxi Service doesn't have it
  - Privacy: driver personal info should be filtered

---

#### Flow 3: Analytics & Monitoring (Post-MVP)

**Note:** For MVP, analytics and operations dashboards are intentionally omitted to focus on core user journey. Post-MVP, the system would include:

- **Business Intelligence**: Booking patterns, revenue metrics, route optimization
- **System Monitoring**: API performance, error rates, service health
- **Data Warehouse**: ETL pipelines for historical analysis using Redshift/BigQuery
- **Alerting**: Automated notifications for system issues or anomalies

**Why Omitted from MVP:**
- Focus on demonstrating client-facing value (traveler experience)
- Analytics don't impact core booking functionality
- Adds significant complexity without showcasing integration benefits
- Can leverage existing monitoring tools (Datadog, New Relic) in production

---

### 2.2 Data Schema Design (MVP)

#### Database 1: Priority Pass Service DB

**Table: users**
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  membership_tier VARCHAR(20), -- 'standard', 'prestige', 'prestige_plus'
  created_at TIMESTAMP,
  -- NO taxi booking data here (separation of concerns)
);
```

**Table: flights**
```sql
CREATE TABLE flights (
  flight_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  flight_number VARCHAR(10),
  departure_airport CHAR(3),  -- IATA code
  arrival_airport CHAR(3),
  departure_time TIMESTAMP,
  terminal VARCHAR(5),
  gate VARCHAR(10),
  status VARCHAR(20), -- 'upcoming', 'departed', 'cancelled'
  created_at TIMESTAMP,
  INDEX idx_user_departure (user_id, departure_time)
);
```

**Table: lounge_access**
```sql
CREATE TABLE lounge_access (
  access_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  lounge_id UUID,
  airport_code CHAR(3),
  access_time TIMESTAMP,
  -- Track lounge usage for business intelligence
);
```

---

#### Database 2: Taxi Service DB

**Table: bookings**
```sql
CREATE TABLE bookings (
  booking_id UUID PRIMARY KEY,
  external_user_id UUID,  -- Could be PP user_id or Taxi app user_id
  user_source VARCHAR(20), -- 'priority_pass', 'taxi_app', 'web'
  pickup_address TEXT,
  dropoff_address TEXT,
  pickup_time TIMESTAMP,
  dropoff_airport CHAR(3),  -- If airport ride
  terminal VARCHAR(5),
  estimated_fare DECIMAL(10, 2),
  actual_fare DECIMAL(10, 2),
  discount_applied DECIMAL(10, 2), -- PP member discount
  status VARCHAR(20), -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  driver_id UUID,
  created_at TIMESTAMP,
  INDEX idx_user_source (external_user_id, user_source),
  INDEX idx_status_time (status, pickup_time)
);
```

**Table: drivers**
```sql
CREATE TABLE drivers (
  driver_id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  vehicle_make VARCHAR(50),
  vehicle_model VARCHAR(50),
  license_plate VARCHAR(20),
  current_location GEOGRAPHY(POINT),  -- PostGIS for geo queries
  status VARCHAR(20), -- 'available', 'on_ride', 'offline'
  rating DECIMAL(3, 2),
  total_rides INT,
  INDEX idx_location (current_location) USING GIST
);
```

---

#### Database 3: Integration Service DB (State Management)

**Table: integration_mappings**
```sql
CREATE TABLE integration_mappings (
  mapping_id UUID PRIMARY KEY,
  pp_user_id UUID,
  taxi_booking_id UUID,
  pp_flight_id UUID,
  created_at TIMESTAMP,
  -- Links PP flight context to Taxi booking
  INDEX idx_pp_user (pp_user_id),
  INDEX idx_taxi_booking (taxi_booking_id)
);
```

**Table: sync_events**
```sql
CREATE TABLE sync_events (
  event_id UUID PRIMARY KEY,
  event_type VARCHAR(50), -- 'booking.created', 'driver.assigned', etc.
  source_system VARCHAR(20), -- 'priority_pass', 'taxi_service'
  target_system VARCHAR(20),
  payload JSONB,  -- Full event data
  processed_at TIMESTAMP,
  status VARCHAR(20), -- 'pending', 'processed', 'failed'
  INDEX idx_status_time (status, processed_at)
);
```

**Justification:**
- **Why separate Integration DB?**
  - Tracks cross-system state without polluting source systems
  - Audit trail for data syncing
  - Recovery mechanism if events fail

---

#### Database 4: Data Warehouse (Analytics)

**Table: booking_analytics**
```sql
CREATE TABLE booking_analytics (
  analytics_id UUID PRIMARY KEY,
  date DATE,
  airport_code CHAR(3),
  hour_of_day INT,
  user_source VARCHAR(20),
  total_bookings INT,
  avg_fare DECIMAL(10, 2),
  avg_pickup_time_mins DECIMAL(5, 2),
  cancellation_rate DECIMAL(5, 4),
  -- Aggregated, no PII
  PRIMARY KEY (date, airport_code, hour_of_day, user_source)
);
```

---

### 2.3 Data Flow Depth Assessment

**Question: Is this thoroughly thought through?**

✅ **YES - Here's Why:**

1. **Clear separation of data ownership**
   - PP owns: users, flights, lounges
   - Taxi owns: bookings, drivers
   - Integration owns: mappings, sync state
   - Analytics owns: aggregated metrics

2. **Scalability considerations**
   - Indexes on high-query columns
   - Read replicas for analytics (mentioned)
   - Event-driven prevents tight coupling
   - Can horizontally scale Integration Service

3. **Privacy by design**
   - Minimal data sharing between systems (only what's necessary for core functionality)
   - Cross-system queries go through Integration Service (gatekeeper)
   - No PII exposed in inter-service communication logs

4. **Failure resilience**
   - Sync events table = retry mechanism
   - If Taxi Service down, Integration Service queues events
   - PP app still works even if taxi integration fails

**Question: Flexible for scale?**

✅ **YES - Here's How:**

- **More schemas**: Add new tables without touching existing ones
- **More users**: Partition bookings table by date, shard by user_id
- **More integrations**: Add new user_source values ('hotel_app', 'airline_app')
- **More data**: Separate hot data (last 30 days) from cold data (archive)

---

## PHASE 3: API GATEWAY ASSESSMENT
### Addressing Feedback Point 3: API Gateway Usage

### 3.1 Current Architecture Issue

**Failed Candidate's Approach (WRONG):**
```
PP Frontend → API Gateway → Flight Data Partner API
```

**Feedback: "Why does API Gateway sit between PP and Flight Partner?"**

**Answer: It shouldn't for this use case.**

---

### 3.2 Corrected Architecture

#### When to Use API Gateway (and When NOT to)

**API Gateway is for:**
- **Public-facing APIs**: Mobile apps, web clients calling your backend
- **Multiple client types**: iOS, Android, Web all hitting same gateway
- **Cross-cutting concerns**: Auth, rate limiting, request logging

**API Gateway is NOT for:**
- **Service-to-service calls**: Backend services calling each other
- **Trusted partner APIs**: Your backend calling Flight Data Partner API
- **Low-latency requirements**: Extra hop adds latency

---

#### Revised Data Flow: Flight Data Integration

```
┌─────────────────────────────────────────────────────────────────┐
│ CORRECT: How Flight Data Flows                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│ Flight Data Partner             │  (e.g., Amadeus, Sabre)
│ (External SaaS)                 │
└─────────────────────────────────┘
         ▲
         │ Direct HTTPS call
         │ (Server-to-Server)
         │ Auth: API Key in header
         │
┌─────────────────────────────────┐
│ Flight Data Service             │  ◄─── Owned by Priority Pass
│ (Backend Service)               │
│                                 │
│ Responsibilities:               │
│ • Poll/webhook from partner     │
│ • Cache flight data             │
│ • Enrich with PP context        │
│ • Handle partner API failures   │
└─────────────────────────────────┘
         │
         │ Internal network call
         │ (No API Gateway needed)
         ▼
┌─────────────────────────────────┐
│ Integration Service             │
│ (Requests flight data)          │
└─────────────────────────────────┘
         │
         │ Via API Gateway
         │ (Auth, rate limit)
         ▼
┌─────────────────────────────────┐
│ Priority Pass Frontend          │
│ (React App)                     │
└─────────────────────────────────┘
```

**Key Changes:**

1. **Flight Data Partner → Flight Data Service**: Direct call, no gateway
   - Why? Both are backend services, trusted connection
   - Use mutual TLS if security is a concern
   - API Gateway adds no value here

2. **PP Frontend → API Gateway → Integration Service**: Keep gateway here
   - Why? Mobile apps are untrusted, need auth/rate limiting
   - Gateway validates JWT tokens
   - Gateway prevents DDoS attacks

---

### 3.3 Complete API Gateway Usage Map

**THROUGH API Gateway:**
```
✅ PP Mobile App → API Gateway → Integration Service
✅ Taxi Mobile App → API Gateway → Taxi Booking Service
✅ Taxi Ops Dashboard → API Gateway → Analytics Service
✅ Third-party webhooks → API Gateway → Webhook Handler
```

**BYPASS API Gateway (Direct Calls):**
```
✅ Integration Service → Flight Data Service (internal)
✅ Integration Service → Taxi Booking Service (internal)
✅ Flight Data Service → Flight Data Partner API (external, trusted)
✅ Notification Service → Push notification provider (external)
✅ Payment Service → Stripe API (external, PCI-compliant)
```

---

### 3.4 API Gateway Configuration (Kong Example)

**Purpose-Specific Routes:**

```yaml
# Kong API Gateway Config

routes:
  # Route 1: Priority Pass app calls
  - name: pp-integration-api
    paths:
      - /api/v1/taxi/*
      - /api/v1/flights/*
      - /api/v1/lounges/*
    plugins:
      - name: jwt
        config:
          key_claim_name: user_id
      - name: rate-limiting
        config:
          minute: 60  # 60 requests/min per user
      - name: cors
        config:
          origins: ["https://prioritypass.com"]
    service: integration-service

  # Route 2: Taxi app calls
  - name: taxi-booking-api
    paths:
      - /api/v1/bookings/*
      - /api/v1/drivers/*
    plugins:
      - name: jwt
      - name: rate-limiting
        config:
          minute: 100  # Higher limit for taxi app
    service: taxi-booking-service

  # Route 3: Future admin/ops endpoints (post-MVP)
  - name: admin-api
    paths:
      - /api/v1/analytics/*
      - /api/v1/admin/*
    plugins:
      - name: key-auth  # API key, not JWT (machine-to-machine)
        config:
          key_names: ["X-Admin-Key"]
      - name: ip-restriction  # Only from office IPs
        config:
          allow: ["203.0.113.0/24"]
    service: analytics-service
```

**Justification:**
- **Different auth per route**: Users use JWT, admins use API keys
- **Different rate limits**: Taxi app gets higher limits (more active users)
- **IP restrictions**: Admin endpoints only from office network
- **CORS**: Prevents unauthorized web apps from calling API

---

### 3.5 Flight Data Partner Integration Details

**Scenario: Amadeus Flight API**

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Flight Data Service (Internal Microservice)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Flight API Client (Python/Node.js)                     │    │
│  │ • Handles Amadeus API auth (OAuth)                     │    │
│  │ • Retries on failure (exponential backoff)             │    │
│  │ • Circuit breaker pattern (if Amadeus down)            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Flight Data Cache (Redis)                              │    │
│  │ • Caches flight data for 1 hour                        │    │
│  │ • Key: flight_number + date                            │    │
│  │ • Reduces Amadeus API calls (cost savings)             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Webhook Listener (if Amadeus supports)                 │    │
│  │ • Receives flight status updates                       │    │
│  │ • Updates cache in real-time                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**

**Scenario A: User Views Flight in PP App**
```
1. PP Frontend: "Show me flight BA123 details"
2. → API Gateway (validates JWT)
3. → Integration Service: GET /flights/BA123
4. → Flight Data Service: Check Redis cache
5a. IF cached: Return immediately (latency: 50ms)
5b. IF not cached:
    → Call Amadeus API (latency: 500ms)
    → Store in Redis (TTL: 1 hour)
    → Return to Integration Service
6. → Integration Service enriches with PP data
7. → Returns to PP Frontend
```

**Scenario B: Flight Status Changes (Real-time)**
```
1. Amadeus webhook: "Flight BA123 delayed by 30 mins"
2. → Flight Data Service webhook endpoint
3. → Updates Redis cache
4. → Publishes event to Event Bus
5. → Integration Service listens to event
6. → Checks: "Any PP members on BA123?"
7. → If yes: Trigger notification
    "Your flight is delayed. We've updated your recommended taxi time."
8. → Notification Service → Push to PP Member
```

**Justification:**
- **Why no API Gateway for Amadeus?**
  - Flight Data Service is server-side, trusted
  - Amadeus already has auth (OAuth), rate limiting
  - Gateway would add latency with no benefit

- **Why cache?**
  - Amadeus charges per API call
  - Flight data doesn't change every second
  - 1-hour cache is fresh enough for pre-flight planning

- **Why separate Flight Data Service?**
  - Isolates third-party dependency
  - If Amadeus API changes, only this service updates
  - Can mock this service for testing Integration Service

---

## PHASE 4: SERVICE COMMUNICATION PATTERN
### Addressing Feedback Point 4: Orchestration Pattern

### 4.1 Pattern Analysis

**Question: Are we using an orchestration pattern?**

**Answer: YES, partially (and that's the problem)**

**Current Design Issue:**
- Integration Service acts as orchestrator (correct)
- BUT: Taxi Booking Service and Notification Service talk directly (incorrect for pure orchestration)

**Feedback:** "If using orchestration, services shouldn't communicate directly."

---

### 4.2 Orchestration vs Choreography

**Orchestration Pattern:**
```
         ┌─────────────────────┐
         │   Orchestrator      │  ◄─── Central brain
         │   (Integration      │
         │    Service)         │
         └─────────────────────┘
           │      │      │
           ▼      ▼      ▼
         [A]    [B]    [C]     ◄─── Services don't talk to each other
```
- **Pro**: Clear control flow, easy to debug
- **Con**: Orchestrator is single point of failure

**Choreography Pattern:**
```
         ┌─────────────────────┐
         │    Event Bus        │  ◄─── Services publish/subscribe
         └─────────────────────┘
           ▲  │  ▲  │  ▲
           │  ▼  │  ▼  │
         [A]    [B]    [C]     ◄─── Services react to events independently
```
- **Pro**: Decoupled, resilient
- **Con**: Harder to trace flow, eventual consistency

---

### 4.3 Recommended Hybrid Pattern (For This MVP)

**Decision: Use orchestration for booking flow, choreography for side effects**

**Why Hybrid?**
- **Booking flow** needs strong consistency (orchestration)
- **Notifications, analytics** can be eventual (choreography)

```
┌─────────────────────────────────────────────────────────────────┐
│ BOOKING FLOW: Orchestration (Sync)                              │
└─────────────────────────────────────────────────────────────────┘

PP Member clicks "Book Taxi"
         │
         ▼
┌─────────────────────────────────┐
│ Integration Service             │  ◄─── Orchestrator
│ (Orchestrates entire flow)      │
└─────────────────────────────────┘
         │
         │ Step 1: Validate user
         ├──────────────────────────────┐
         ▼                              │
┌─────────────────────────────────┐    │
│ User Service                    │    │
│ Returns: user_id, tier          │    │
└─────────────────────────────────┘    │
         │                              │
         │ RETURNS to orchestrator      │
         ▼◄─────────────────────────────┘
┌─────────────────────────────────┐
│ Integration Service             │
└─────────────────────────────────┘
         │
         │ Step 2: Get flight details
         ├──────────────────────────────┐
         ▼                              │
┌─────────────────────────────────┐    │
│ Flight Data Service             │    │
│ Returns: airport, terminal      │    │
└─────────────────────────────────┘    │
         │                              │
         │ RETURNS to orchestrator      │
         ▼◄─────────────────────────────┘
┌─────────────────────────────────┐
│ Integration Service             │
└─────────────────────────────────┘
         │
         │ Step 3: Calculate fare & time
         │ (Orchestrator does this locally)
         │
         │ Step 4: Create taxi booking
         ├──────────────────────────────┐
         ▼                              │
┌─────────────────────────────────┐    │
│ Taxi Booking Service            │    │
│ Returns: booking_id, status     │    │
└─────────────────────────────────┘    │
         │                              │
         │ RETURNS to orchestrator      │
         ▼◄─────────────────────────────┘
┌─────────────────────────────────┐
│ Integration Service             │
│ Booking complete!               │
└─────────────────────────────────┘
         │
         │ Step 5: Publish success event
         ▼
┌─────────────────────────────────┐
│ Event Bus                       │
└─────────────────────────────────┘
         │
         │ Now choreography takes over...
         │
┌────────┴────────────────────────────────────────┐
│                                                  │
▼                           ▼                      ▼
[Notification Service]  [Analytics Service]  [Audit Service]
(Sends push)            (Logs metric)        (Records event)

^ These services react independently, no orchestrator needed
```

**Key Principle:**
- **Orchestrator calls services directly (request/response)**
- **Services NEVER call each other directly**
- **After orchestrator finishes, event published**
- **Side-effect services react to event independently**

---

### 4.4 Corrected Service Communication Rules

**ALLOWED:**
```
✅ Integration Service → User Service (orchestration)
✅ Integration Service → Flight Data Service (orchestration)
✅ Integration Service → Taxi Booking Service (orchestration)
✅ Integration Service → Event Bus (publish event)
✅ Notification Service ← Event Bus (subscribe)
✅ Analytics Service ← Event Bus (subscribe)
```

**NOT ALLOWED:**
```
❌ Taxi Booking Service → Notification Service (direct call)
❌ Flight Data Service → Analytics Service (direct call)
❌ User Service → Integration Service (reverse call)
```

**Exception (Acceptable):**
```
⚠️ Taxi Booking Service → Payment Service (direct call)
   Why? Payment is synchronous, must succeed before confirming booking
   Alternative: Orchestrator could call Payment directly, then Taxi Service
```

---

### 4.5 Component Diagram: Integration Service (Deep Dive)

**This is what the failed candidate missed: internal component detail**

```
┌─────────────────────────────────────────────────────────────────┐
│ INTEGRATION SERVICE (Container)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ API Controller (Express.js)                            │    │
│  │ • POST /api/taxi/booking-request                       │    │
│  │ • GET /api/taxi/booking-status/:id                     │    │
│  │ • PATCH /api/taxi/booking-cancel/:id                   │    │
│  └────────────────────────────────────────────────────────┘    │
│         │                                                       │
│         ▼                                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Booking Orchestrator (Core Component)                  │    │
│  │                                                         │    │
│  │ Methods:                                                │    │
│  │ • orchestrateBooking(userRequest)                      │    │
│  │   ├─ validateUser()                                    │    │
│  │   ├─ fetchFlightContext()                              │    │
│  │   ├─ calculateRecommendedTime()                        │    │
│  │   ├─ enrichBookingRequest()                            │    │
│  │   ├─ createTaxiBooking()                               │    │
│  │   └─ publishSuccessEvent()                             │    │
│  │                                                         │    │
│  │ • handleBookingFailure(error)                          │    │
│  │   ├─ logError()                                        │    │
│  │   ├─ rollbackIfNeeded()                                │    │
│  │   └─ notifyUser()                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│         │                                                       │
│         ▼                                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Service Clients (Adapters)                             │    │
│  │                                                         │    │
│  │ ┌─────────────────┐  ┌─────────────────┐             │    │
│  │ │ UserServiceClient│  │FlightDataClient │             │    │
│  │ │ • getUser()     │  │ • getFlight()   │             │    │
│  │ │ • validateTier()│  │ • getAirport()  │             │    │
│  │ └─────────────────┘  └─────────────────┘             │    │
│  │                                                         │    │
│  │ ┌─────────────────┐  ┌─────────────────┐             │    │
│  │ │TaxiServiceClient│  │EventBusPublisher│             │    │
│  │ │ • createBooking()│  │ • publish()     │             │    │
│  │ │ • cancelBooking()│  │                 │             │    │
│  │ └─────────────────┘  └─────────────────┘             │    │
│  └────────────────────────────────────────────────────────┘    │
│         │                                                       │
│         ▼                                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Time Calculation Engine                                │    │
│  │                                                         │    │
│  │ Input: flight_time, airport_code, user_address         │    │
│  │ Output: recommended_taxi_pickup_time                   │    │
│  │                                                         │    │
│  │ Algorithm:                                              │    │
│  │ 1. Get airport distance (Google Maps API)              │    │
│  │ 2. Calculate drive time (distance/speed + traffic)     │    │
│  │ 3. Add security buffer (90 min international)          │    │
│  │ 4. Add preparation buffer (15 min)                     │    │
│  │ 5. Return pickup_time = flight_time - total_buffer     │    │
│  └────────────────────────────────────────────────────────┘    │
│         │                                                       │
│         ▼                                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Data Mapper                                            │    │
│  │ • mapPPUserToTaxiRequest()                             │    │
│  │ • mapTaxiResponseToPPFormat()                          │    │
│  │ • enrichWithFlightContext()                            │    │
│  └────────────────────────────────────────────────────────┘    │
│         │                                                       │
│         ▼                                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ State Manager (PostgreSQL)                             │    │
│  │ • Tracks booking orchestration state                   │    │
│  │ • Enables retry on failure                             │    │
│  │ • Audit trail for debugging                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**This is the level of detail your Component Diagram needs!**

**Justification:**
- Shows **specific classes/modules**, not just "handles bookings"
- Shows **data flow** through components
- Shows **responsibilities** of each component
- Shows **algorithms** (Time Calculation Engine)

---

### 4.6 Component Diagram: Taxi Booking Service (Optional Deep Dive)

**Purpose:** Show internal structure of Taxi Booking Service

**Note:** For MVP presentation, the Integration Service component diagram (4.5) is sufficient. This is provided for completeness.

```
┌─────────────────────────────────────────────────────────────────┐
│ TAXI BOOKING SERVICE (Container)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMPONENT 1: Booking API                                       │
│  • POST /bookings                                               │
│  • GET /bookings/:id                                            │
│  • PATCH /bookings/:id/cancel                                   │
│  • PATCH /bookings/:id/status                                   │
│                                                                  │
│  COMPONENT 2: Booking Manager                                   │
│  • createBooking()                                              │
│  • assignDriver() ← Uses matching algorithm                     │
│  • updateStatus()                                               │
│  • cancelBooking()                                              │
│                                                                  │
│  COMPONENT 3: Driver Matching Engine                            │
│  • findNearestAvailableDriver(pickup): Driver                   │
│  • Queries driver locations (PostGIS)                           │
│  • Considers: distance, rating, availability                    │
│                                                                  │
│  COMPONENT 4: Event Publisher                                   │
│  • Publishes events to Event Bus:                               │
│    - booking.created                                            │
│    - driver.assigned                                            │
│    - ride.started                                               │
│    - ride.completed                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 5: REACT UI STRUCTURE

### 5.1 Folder Structure

```
priority-pass-taxi-integration/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Timeline.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   ├── flight/
│   │   │   ├── FlightCard.tsx
│   │   │   └── FlightTimeline.tsx
│   │   │
│   │   ├── taxi/
│   │   │   ├── TaxiBookingWidget.tsx
│   │   │   ├── RecommendedTimeDisplay.tsx
│   │   │   ├── DriverTrackingCard.tsx
│   │   │   └── FareEstimator.tsx
│   │   │
│   │   └── lounge/
│   │       ├── LoungeCard.tsx
│   │       └── LoungeList.tsx
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── TripPlannerPage.tsx       # Main integrated experience ★
│   │   ├── BookingSummaryPage.tsx
│   │   └── ActiveRidePage.tsx
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── integrationAPI.ts
│   │   │   ├── mockData.ts
│   │   │   └── apiClient.ts
│   │   │
│   │   └── utils/
│   │       ├── timeCalculations.ts
│   │       ├── formatters.ts
│   │       └── constants.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── api.types.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── theme.ts
│   │
│   ├── App.tsx
│   ├── routes.tsx
│   └── index.tsx
│
├── public/
│   └── assets/
│       ├── logo-pp.svg
│       ├── icon-taxi.svg
│       └── icon-lounge.svg
│
├── README.md
├── package.json
└── tsconfig.json
```

---

### 5.2 Key Page: TripPlannerPage.tsx (Wireframe)

```
┌──────────────────────────────────────────────────────────────┐
│ Priority Pass                               [Profile] [Menu]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Your Upcoming Trip                                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📍 London (LHR) → New York (JFK)                       │  │
│  │ BA281 • Mon, Oct 20                                    │  │
│  │ Departure: 14:30 • Terminal 5 • Gate A22              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🚖 Recommended Taxi Departure                          │  │
│  │                                                         │  │
│  │         12:00 PM                                       │  │
│  │    ↓ 45 min drive                                      │  │
│  │         12:45 PM Arrive at LHR                         │  │
│  │    ↓ 90 min buffer                                     │  │
│  │         14:30 PM Flight Departs ✈️                     │  │
│  │                                                         │  │
│  │ 🕐 Book taxi for departure in: 1 hour 23 mins          │  │
│  │                                                         │  │
│  │ [Book Taxi Now]                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🛋️ Available Lounges at LHR Terminal 5                 │  │
│  │                                                         │  │
│  │ ┌─────────────────────────────────────────────┐        │  │
│  │ │ British Airways Galleries Lounge            │        │  │
│  │ │ • WiFi, Hot Food, Showers                   │        │  │
│  │ │ • Open: 5:00 AM - 11:00 PM                  │        │  │
│  │ │ [View Details]                              │        │  │
│  │ └─────────────────────────────────────────────┘        │  │
│  │                                                         │  │
│  │ ┌─────────────────────────────────────────────┐        │  │
│  │ │ + 2 more lounges available                  │        │  │
│  │ └─────────────────────────────────────────────┘        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✨ Upon Arrival in New York                            │  │
│  │ • 3 lounges available at JFK Terminal 4                │  │
│  │ • Book return taxi with 10% PP member discount         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

### 5.3 TypeScript Types (types/index.ts)

```typescript
// User
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipTier: 'standard' | 'prestige' | 'prestige_plus';
}

// Flight
export interface Flight {
  flightId: string;
  userId: string;
  flightNumber: string;
  departureAirport: string;  // IATA code
  arrivalAirport: string;
  departureTime: string;  // ISO 8601
  terminal: string;
  gate?: string;
  status: 'upcoming' | 'departed' | 'cancelled';
}

// Taxi Booking
export interface TaxiBooking {
  bookingId: string;
  userId: string;
  flightId?: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: string;
  estimatedArrival: string;
  estimatedFare: number;
  discountApplied: number;
  status: 'pending' | 'confirmed' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';
  driver?: {
    name: string;
    vehicle: string;
    licensePlate: string;
    phone: string;
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
}

// Recommended Departure Time
export interface RecommendedDeparture {
  pickupTime: string;
  driveTimeMinutes: number;
  arrivalTime: string;
  securityBufferMinutes: number;
  flightDepartureTime: string;
  reasoning: string;
}

// Lounge
export interface Lounge {
  loungeId: string;
  name: string;
  airportCode: string;
  terminal: string;
  amenities: string[];
  openingHours: string;
  imageUrl?: string;
}
```

---

### 5.4 Mock Data (services/api/mockData.ts)

```typescript
import { Flight, Lounge, RecommendedDeparture } from '../../types';

export const mockFlight: Flight = {
  flightId: 'flt_001',
  userId: 'user_123',
  flightNumber: 'BA281',
  departureAirport: 'LHR',
  arrivalAirport: 'JFK',
  departureTime: '2025-10-20T14:30:00Z',
  terminal: '5',
  gate: 'A22',
  status: 'upcoming',
};

export const mockLounges: Lounge[] = [
  {
    loungeId: 'lng_001',
    name: 'British Airways Galleries Lounge',
    airportCode: 'LHR',
    terminal: '5',
    amenities: ['WiFi', 'Hot Food', 'Showers', 'Business Center'],
    openingHours: '05:00 - 23:00',
  },
  {
    loungeId: 'lng_002',
    name: 'American Express Lounge',
    airportCode: 'JFK',
    terminal: '4',
    amenities: ['WiFi', 'Premium Dining', 'Spa Services'],
    openingHours: '06:00 - 22:00',
  },
];

export const mockRecommendedDeparture: RecommendedDeparture = {
  pickupTime: '2025-10-20T12:00:00Z',
  driveTimeMinutes: 45,
  arrivalTime: '2025-10-20T12:45:00Z',
  securityBufferMinutes: 90,
  flightDepartureTime: '2025-10-20T14:30:00Z',
  reasoning: 'Recommended pickup at 12:00 PM: 45 min drive + 15 min prep + 90 min security buffer',
};
```

---

## PHASE 6: C4 DIAGRAMS SPECIFICATION

### 6.1 Context Diagram (C4 Level 1)

**Purpose:** Show the system in its environment

**Actors to Include:**
1. Priority Pass Member (person icon)
2. Taxi App User (person icon)
3. Taxi Driver (person icon)

**External Systems:**
1. Flight Data Partner (e.g., Amadeus)
2. Payment Gateway (e.g., Stripe)
3. SMS/Email Provider (e.g., Twilio, SendGrid)
4. Push Notification Service (e.g., Firebase)

**Your System (single box):**
- "Priority Pass × Taxi Integration Platform"

**Arrows:**
```
PP Member → Platform: "Books taxi, views flights, accesses lounges"
Taxi User → Platform: "Books rides, sees PP lounge offers"
Taxi Driver → Platform: "Accepts rides, updates status"

Platform → Flight Data Partner: "Fetches flight data"
Platform → Payment Gateway: "Processes payments"
Platform → SMS/Email Provider: "Sends notifications"
Platform → Push Notification: "Sends push alerts"
```

**Annotation:**
- Add note: "Cross-platform data sharing via secure APIs"
- Add note: "Minimal data exchange - only booking essentials"

---

### 6.2 Container Diagram (C4 Level 2)

**Purpose:** Break down the system into major services

**Containers (T-Shirt Sizes):**

**FRONTEND CONTAINERS:**
1. Priority Pass Web App (React) - **M**
2. Taxi Mobile App (iOS/Android) - **M**
3. Taxi Driver App (iOS/Android) - **S**
4. Taxi Operations Dashboard (React) - **M** ← ADDED

**BACKEND CONTAINERS:**
5. API Gateway (Kong/AWS API Gateway) - **S**
6. Integration Service (Node.js) - **L** ← Core integration logic
7. Priority Pass Service (Node.js) - **L**
8. Taxi Booking Service (Node.js) - **M**
9. Flight Data Service (Python) - **M** ← Handles flight API
10. User Identity Service (Auth0) - **XS** (managed)
11. Notification Service (Node.js) - **S**
12. Analytics Service (Python) - **M**
13. Payment Service (Stripe integration) - **XS** (managed)

**DATA CONTAINERS:**
14. PP Database (PostgreSQL) - **M**
15. Taxi Database (PostgreSQL) - **M**
16. Integration State DB (PostgreSQL) - **S**
17. Data Warehouse (Redshift/BigQuery) - **L**
18. Cache Layer (Redis) - **S**
19. Event Bus (AWS EventBridge/Kafka) - **M**

---

**T-Shirt Size Justification:**

| Size | Effort | Reasoning |
|------|--------|-----------|
| XS | 1-3 days | Managed service, config only |
| S | 1 week | Simple service, well-defined scope |
| M | 2-3 weeks | Moderate complexity, some integrations |
| L | 1-2 months | Complex logic, multiple integrations |
| XL | 3+ months | Core system, mission-critical |

**Integration Service = L because:**
- Orchestrates multiple services
- Complex data mapping/enrichment
- Error handling, retries, circuit breakers
- State management across systems
- Business logic (time calculations, fare adjustments)

**Flight Data Service = M because:**
- External API integration (Amadeus)
- Caching logic
- Webhook handling
- Error handling for third-party failures
- NOT L because: Single responsibility (just flights)

---

### 6.3 Component Diagram (C4 Level 3): Integration Service

**Purpose:** Show internal structure of Integration Service

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│ INTEGRATION SERVICE (Container)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMPONENT 1: API Controller Layer                              │
│  ├─ BookingController                                           │
│  │  • POST /api/taxi/booking-request                            │
│  │  • GET /api/taxi/booking-status/:id                          │
│  │  • DELETE /api/taxi/booking-cancel/:id                       │
│  │                                                               │
│  ├─ TripController                                              │
│  │  • GET /api/trips/upcoming                                   │
│  │  • GET /api/trips/:id/details                                │
│  │                                                               │
│  └─ HealthController                                            │
│     • GET /health (service status)                              │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  COMPONENT 2: Orchestration Layer                               │
│  ├─ BookingOrchestrator                                         │
│  │  Methods:                                                    │
│  │  • orchestrateBooking(request): BookingResponse              │
│  │  • orchestrateCancellation(bookingId): CancelResponse        │
│  │  • handleFailure(error): void                                │
│  │                                                               │
│  │  Internal Logic:                                             │
│  │  1. Validate user (call UserServiceClient)                   │
│  │  2. Fetch flight (call FlightDataClient)                     │
│  │  3. Calculate time (call TimeCalculator)                     │
│  │  4. Enrich request (call DataMapper)                         │
│  │  5. Create booking (call TaxiServiceClient)                  │
│  │  6. Save state (call StateManager)                           │
│  │  7. Publish event (call EventPublisher)                      │
│  │                                                               │
│  └─ TripOrchestrator                                            │
│     • Aggregates data from multiple services for trip view      │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  COMPONENT 3: Business Logic Layer                              │
│  ├─ TimeCalculationEngine                                       │
│  │  Methods:                                                    │
│  │  • calculateRecommendedPickup(flight, address): DateTime     │
│  │  • calculateDriveTime(origin, destination): Minutes          │
│  │  • getSecurityBuffer(flightType): Minutes                    │
│  │                                                               │
│  │  Algorithm:                                                  │
│  │  pickup_time = flight_departure                              │
│  │                - security_buffer (90 or 120 min)             │
│  │                - drive_time (from Maps API)                  │
│  │                - prep_buffer (15 min)                        │
│  │                                                               │
│  ├─ FareCalculator                                              │
│  │  • calculateEstimate(distance, tier): Fare                   │
│  │  • applyDiscount(fare, membershipTier): DiscountedFare       │
│  │                                                               │
│  └─ RuleEngine                                                  │
│     • validateBookingRules(request): ValidationResult           │
│     • checkMembershipEligibility(user): boolean                 │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  COMPONENT 4: Integration Adapters (Service Clients)            │
│  ├─ UserServiceClient                                           │
│  │  • getUser(userId): User                                     │
│  │  • validateMembership(userId): MembershipDetails             │
│  │                                                               │
│  ├─ FlightDataClient                                            │
│  │  • getFlight(flightId): Flight                               │
│  │  • getAirportInfo(airportCode): Airport                      │
│  │                                                               │
│  ├─ TaxiServiceClient                                           │
│  │  • createBooking(request): BookingResponse                   │
│  │  • getBookingStatus(bookingId): Status                       │
│  │  • cancelBooking(bookingId): CancelResponse                  │
│  │                                                               │
│  └─ MapsServiceClient (Google Maps API)                         │
│     • calculateDistance(origin, destination): Distance          │
│     • estimateDuration(origin, destination): Duration           │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  COMPONENT 5: Data Transformation                               │
│  ├─ DataMapper                                                  │
│  │  • mapPPRequestToTaxiFormat(ppRequest): TaxiRequest          │
│  │  • mapTaxiResponseToPPFormat(taxiResp): PPResponse           │
│  │  • enrichWithFlightContext(booking, flight): EnrichedBooking │
│  │                                                               │
│  └─ DataValidator                                               │
│     • validateAddress(address): boolean                         │
│     • validateDateTime(dateTime): boolean                       │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  COMPONENT 6: State & Persistence                               │
│  ├─ StateManager                                                │
│  │  • saveOrchestrationState(state): void                       │
│  │  • getState(bookingId): State                                │
│  │  • Enables retry after failure                               │
│  │                                                               │
│  └─ MappingRepository                                           │
│     • createMapping(ppUserId, taxiBookingId): void              │
│     • getMapping(identifier): Mapping                           │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  COMPONENT 7: Event Management                                  │
│  ├─ EventPublisher                                              │
│  │  • publishBookingCreated(booking): void                      │
│  │  • publishBookingCancelled(bookingId): void                  │
│  │                                                               │
│  └─ EventSubscriber                                             │
│     • onDriverAssigned(event): void                             │
│     • onRideCompleted(event): void                              │
│     (Updates PP system with taxi status changes)                │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  COMPONENT 8: Resilience & Monitoring                           │
│  ├─ CircuitBreaker                                              │
│  │  • Prevents cascading failures                               │
│  │  • If TaxiService down, opens circuit → fail fast            │
│  │                                                               │
│  ├─ RetryHandler                                                │
│  │  • Exponential backoff for transient failures                │
│  │                                                               │
│  └─ Logger                                                      │
│     • Structured logging (JSON)                                 │
│     • Sends to centralized logging (e.g., ELK Stack)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**This is the detail level needed!**

---

## PHASE 7: README DOCUMENTATION

### Architecture Overview

```markdown
# Priority Pass × Taxi App Integration

## System Overview

This system integrates Priority Pass's airport lounge access platform with a 
global taxi booking service, providing travelers with a seamless door-to-lounge 
journey experience.

## Key Actors (MVP)

1. **Priority Pass Member**: Books taxis, views flights, accesses lounges
2. **Taxi App User**: Books rides, sees PP lounge recommendations
3. **Taxi Driver**: Accepts/declines rides, navigates routes

**Note:** Operations/management actors (Taxi Manager, PP Operations Team) are post-MVP features focused on after establishing core user journey.

## Architectural Decisions

### 1. Hybrid Orchestration-Choreography Pattern

**Decision**: Use orchestration for booking flow, choreography for side effects.

**Reasoning**:
- Booking requires strong consistency (user expects immediate confirmation)
- Notifications/analytics can be eventually consistent
- Orchestrator (Integration Service) provides clear control flow
- Event Bus decouples side-effect services

**Trade-off**: Orchestrator is potential single point of failure
- Mitigation: High availability deployment, health checks, circuit breakers

### 2. Separate Flight Data Service

**Decision**: Create dedicated service for flight partner integration.

**Reasoning**:
- Isolates third-party dependency
- Enables caching (reduces API costs)
- Circuit breaker prevents cascading failures
- Can mock this service for testing

**Trade-off**: Additional service to maintain
- Mitigation: Small, focused service (T-shirt size: M)

### 3. API Gateway for Client Requests Only

**Decision**: API Gateway for mobile apps, direct calls for service-to-service.

**Reasoning**:
- Mobile apps need auth, rate limiting, CORS
- Backend services are trusted (same VPC), don't need gateway overhead
- Reduces latency for internal calls

**Example**:
✅ PP App → API Gateway → Integration Service (authenticated)
✅ Integration Service → Flight Data Service (direct, internal)
❌ Integration Service → API Gateway → Flight Data Service (unnecessary hop)

### 4. Event-Driven for Cross-System Updates

**Decision**: Use Event Bus (AWS EventBridge) for publishing booking events.

**Reasoning**:
- Multiple systems need to react (Notification, Analytics, Audit)
- Decouples services (can add new listeners without changing publishers)
- Asynchronous processing improves response time

**Trade-off**: Eventual consistency
- Mitigation: Critical path (booking) is synchronous; only side effects are async

### 5. Scalable Data Architecture

**Decision**: Separate operational data (PostgreSQL) from analytics (Data Warehouse).

**Reasoning**:
- Operational databases optimized for transactional workload (OLTP)
- Analytics queries can be expensive, shouldn't impact live operations
- Data warehouse optimized for read-heavy, aggregation queries (OLAP)
- Enables future business intelligence and reporting features without performance impact

**Data Access Control**:
- Managers see: airport-level metrics, anonymized patterns
- Managers DON'T see: individual user names, flight numbers, PII

## PCI Compliance Strategy

### 1. No Card Data Storage
- Payment processing handled entirely by PCI-compliant gateway (Stripe)
- Our system never sees raw card numbers
- Store only: payment_method_id (token), last_4_digits, card_brand

### 2. Network Segmentation
- Payment Service in separate VPC
- No direct access from public internet
- API Gateway → Payment Service only

### 3. Data Encryption
- **In Transit**: TLS 1.3 for all API calls
- **At Rest**: PostgreSQL encryption enabled
- **Tokenization**: Payment tokens, never raw data

### 4. Access Control
- Least privilege principle
- Services can only access their own data stores
- Cross-service data access goes through Integration Service (gatekeeper)
- Audit logs for all payment transactions (immutable)

### 5. Compliance Scope Reduction
- By using Stripe, we reduce PCI DSS scope
- Our system is "PCI DSS SAQ A" compliant (simplest level)

## Omissions & Trade-offs

### What's Missing (MVP Scope)

1. **Real-time Driver Tracking (WebSockets)**
   - Current: Polling every 10 seconds
   - Future: WebSocket connection for live updates
   - Why omitted: Infrastructure complexity

2. **Multi-Currency Support**
   - Current: GBP and USD only
   - Future: Dynamic currency conversion
   - Why omitted: Forex APIs, tax rules vary by country

3. **Offline Mode**
   - Current: Requires internet connection
   - Future: Service Workers cache data
   - Why omitted: Complex cache invalidation

4. **Advanced Driver Matching**
   - Current: Nearest available driver
   - Future: ML model predicts best driver
   - Why omitted: Requires training data

### Technical Shortcuts

1. **Mock Taxi Service**
   - Current: Simulated taxi bookings
   - Production: Integrate real APIs (Uber, Bolt)

2. **Hard-Coded Time Calculations**
   - Current: Fixed buffers (90 min security)
   - Production: ML learns optimal buffers per airport

3. **No Error Monitoring**
   - Current: Console logs
   - Production: Sentry, PagerDuty

### How I'd Address in Production

**Phase 2 (3 months)**:
- Real-time tracking via WebSockets
- Error monitoring (Sentry)
- Multi-currency support

**Phase 3 (6 months)**:
- ML-based driver matching
- Predictive analytics
- Offline mode

## Technology Choices

### Frontend
- **React + TypeScript**: Type safety, component reusability
- **Axios**: HTTP client with interceptors

### Backend
- **Node.js (Express)**: Fast I/O, JavaScript across stack
- **PostgreSQL**: ACID compliance, geo-queries (PostGIS)
- **Redis**: In-memory caching
- **AWS EventBridge**: Managed event bus
```

---

## PHASE 8: PRESENTATION STRATEGY

### 8.1 Presentation Flow (10 minutes)

**Slide 1: Business Value (1 min)**
> "Travelers juggle multiple apps: checking flights, booking taxis, finding 
> lounges. This integration creates a unified airport journey experience."

**Slide 2: User Journey Demo (2 mins)**
- Live demo of React UI
- Show: Flight view → Recommended time calculation → Book taxi → See lounges
- Highlight: "Seamless cross-platform experience with smart recommendations"

**Slide 3: Architecture Overview (3 mins)**
- **Context Diagram**: "3 core actors (Member, Taxi User, Driver) with clean separation"
- **Container Diagram**: "11 containers, T-shirt sized for realistic MVP scope"
- **Component Diagram**: "Inside Integration Service, here's the orchestration logic"

**Slide 4: Key Decisions (2 mins)**
- Hybrid orchestration-choreography pattern
- API Gateway only for client requests (not service-to-service)
- Scalable data architecture (operational vs. analytics)

**Slide 5: Data Flow Deep Dive (1 min)**
- Show sequence diagram
- Explain enrichment process

**Slide 6: Trade-offs & Roadmap (1 min)**
- Honest about MVP shortcuts
- Show Phase 2/3 roadmap

---

### 8.2 Anticipated Questions & Answers

**Q: Why not use microservices for everything?**
A: We balance simplicity and scalability. Integration Service handles 
orchestration logic together because it's cohesive.

**Q: How do you prevent Integration Service from becoming a monolith?**
A: It's organized into 8 clear components. If it grows, we can extract 
components like TimeCalculationEngine.

**Q: What if the Taxi Service API is down?**
A: Circuit breaker pattern. After 3 failures, Integration Service stops 
calling, returns cached availability.

**Q: How would operational monitoring work in production?**
A: Post-MVP, we'd add admin dashboards with aggregated metrics (no PII). Operations 
teams would see patterns and system health, not individual user details.

**Q: Why not use GraphQL instead of REST?**
A: For MVP, REST is simpler. GraphQL makes sense if we have many clients with 
different data needs.

**Q: How do you handle timezones?**
A: All times stored in UTC. Frontend converts to user's local timezone.

---

## FINAL CHECKLIST

**Before you build:**
- [ ] Review all 4 feedback points from failed candidate
- [ ] Understand C4 progressive zoom (Context → Container → Component)
- [ ] Understand API Gateway usage (client-facing only, not service-to-service)
- [ ] Understand orchestration pattern (Integration Service as orchestrator)
- [ ] Understand component-level detail needed (methods, data flows, algorithms)

**When building React UI:**
- [ ] Use TypeScript for type safety
- [ ] Create mock data that matches API types
- [ ] Build TripPlannerPage as centerpiece
- [ ] Show recommended departure time prominently

**When creating C4 diagrams:**
- [ ] **Context**: Show all 5 actors
- [ ] **Container**: Show 19 containers with T-shirt sizes
- [ ] **Component**: Pick Integration Service, show 8 internal components

**When writing README:**
- [ ] Justify every architectural decision
- [ ] Explain PCI compliance
- [ ] Be honest about MVP shortcuts
- [ ] Show roadmap

---

## NEXT STEPS

Ready to help you:
1. Build the React project
2. Create C4 diagrams
3. Write README sections
4. Prepare presentation

---

**Document End**

*This plan addresses all 4 feedback points from the failed candidate submission 
and provides a comprehensive, defensible architecture for the Priority Pass × 
Taxi App integration.*

