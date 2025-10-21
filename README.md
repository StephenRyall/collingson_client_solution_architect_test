# Priority Pass × Taxi App Integration

## 🎯 Project Overview

This is a React TypeScript application demonstrating the integration between **Priority Pass** (airport lounge access platform) and a **global taxi booking service**. The system provides travelers with a seamless door-to-lounge journey experience.

### Key Features
- ✈️ **Flight Information Display** with real-time status
- 🚖 **Smart Taxi Booking** with recommended departure times
- 🛋️ **Airport Lounge Access** at departure and arrival airports
- 💰 **Priority Pass Member Discounts** (10% off taxi fares)
- 📱 **Responsive Design** for mobile and desktop

---

## 🏗️ Architecture Overview

This application demonstrates a **client-side MVP** that would integrate with backend services in production.

### Key Architectural Principles

#### 1. **Platform Independence**
- **Priority Pass** and **Taxi Booking** are **separate systems** with their own databases
- No shared database or direct database access between platforms
- Communication **only through REST APIs**
- Each platform can scale, deploy, and evolve independently

#### 2. **Integration Service as Orchestrator & Adapter**
The Integration Service acts as the **single point of integration** with external Taxi Platform:
- **Orchestrates booking flow**: Validates user → Gets flight data → Calls Taxi API → Publishes events
- **Enriches requests**: Adds flight context, membership tier, and PP-specific data before sending to Taxi API
- **Receives webhooks**: Processes Taxi Platform status updates (driver assigned, ride completed)
- **Maps data formats**: Translates between PP and Taxi schemas (no other PP service talks to Taxi directly)
- **Maintains UUID correlation**: Stores mapping table (pp_booking_id ↔ taxi_booking_id)

**Why no separate "Taxi Booking Service" in PP?**
- Taxi Platform is an **external partner** (like Uber/Lyft), not owned by PP
- Integration Service contains all Taxi integration logic as internal components
- Simpler architecture: fewer services to maintain and deploy
- Flexible: Easy to add new taxi providers (Bolt, Lyft) by adding client adapters to Integration Service

#### 3. **Event-Driven Updates**
- **Orchestration** (synchronous): PP → Integration Service → Taxi API for bookings
- **Choreography** (asynchronous): Taxi webhooks → Event Bus → Notification/Analytics
- User gets immediate booking confirmation, while notifications/analytics happen in background

#### 4. **Security & Compliance**
- **API Gateway** enforces authentication, rate limiting for all client requests
- **Service-to-service** communication bypasses gateway (trusted internal network)
- **Payment data** stays within each platform's PCI-compliant payment service
- **Minimal data sharing**: Only user_id, membership_tier, and booking UUIDs cross platforms

### T-Shirt Sizing (Container Diagram Estimates)

The following estimates represent the complexity and effort required to build each **Priority Pass backend service** in the Container Diagram:

| Service | Size | Justification |
|---------|------|---------------|
| **API Gateway** | **S** | Standard configuration using Kong/AWS API Gateway. Mostly setup and routing rules. |
| **Integration Service** | **XL** | Most complex service - handles orchestration, time calculations, data enrichment, state management, error handling, webhook processing, and coordinates all other services. Acts as adapter layer to external Taxi Platform. |
| **Flight Data Service** | **M** | Moderate complexity - integrates with external flight APIs, caching layer, data normalization. Mostly API wrapping and data transformation. |
| **User Identity Service** | **M** | Standard OAuth 2.0 implementation with user profile management, notification preferences. Well-established patterns (Auth0/Keycloak). |
| **Notification Service** | **S** | Simple service using existing providers (SendGrid, Twilio, Firebase). Template management and delivery tracking. |
| **Event Bus** | **S** | Managed service (AWS EventBridge/Kafka). Mostly configuration and topic setup. |
| **Priority Pass Database** | **M** | PostgreSQL with standard schema. Well-defined data model. |

**Total Estimated Effort for Priority Pass Platform:** ~4-5 months for a team of 4-5 engineers

**Note:** Taxi Booking Platform (external partner) and Payment Gateway (handled by Taxi Platform) are **not built by Priority Pass** and therefore not included in effort estimates.

### Design Patterns Used

1. **Component-Based Architecture**
   - Reusable UI components (Button, Card, Timeline, StatusBadge)
   - Feature-specific components (FlightCard, TaxiBookingWidget, LoungeCard)
   - Clean separation of concerns

2. **Mock Data Layer**
   - Simulates backend API responses
   - Enables full UI demonstration without backend
   - Located in `src/services/api/mockData.ts`

3. **Utility Layer**
   - Time calculations (recommended departure logic)
   - Formatting helpers (dates, currency, durations)
   - Business logic separated from UI

### C4 Diagrams

All C4 Diagrams can be found in the 'diagrams' folder that outlines a standard booking flow.

### Integration Architecture: Priority Pass ↔ Taxi Platform

This system demonstrates a **loosely-coupled integration** between two independent platforms using a **generic API contract**.

#### Design Principle: Platform Independence

```
┌──────────────────────────┐         ┌──────────────────────────┐
│   Priority Pass Platform │         │   Taxi Booking Platform  │
│   (Separate Database)    │◄───────►│   (Separate Database)    │
└──────────────────────────┘         └──────────────────────────┘
         Own Data                            Own Data
    • PP User Profiles                  • Driver Locations
    • Membership Tiers                  • Vehicle Fleet
    • Flight Bookings                   • Ride History
    • Lounge Access                     • Fare Pricing
```

**Key Architectural Decision:**
- **No shared database** - Each platform maintains its own data sovereignty
- **No database exposure** - Neither platform accesses the other's database directly
- **API-first integration** - All communication via REST APIs through Integration Service

#### Integration Contract: What Gets Shared?

**Priority Pass → Taxi Platform (at booking time):**

```javascript
{
  "pp_booking_id": "uuid-1234-5678-...",  // ← Unique identifier for tracking
  "user_id": "pp_member_456",              // ← For account linking
  "membership_tier": "prestige",           // ← For discount calculation
  "pickup_details": {
    "address": "123 Main St, London",
    "datetime": "2025-10-20T12:00:00Z"
  },
  "flight_context": {                      // ← For recommended timing
    "flight_number": "BA281",
    "departure_time": "2025-10-20T14:30:00Z",
    "airport": "LHR",
    "terminal": "5"
  }
}
```

**Taxi Platform → Priority Pass (response & updates):**

```javascript
{
  "taxi_booking_id": "TXI_9999",          // ← Taxi's internal ID
  "pp_booking_id": "uuid-1234-5678-...",  // ← For correlation
  "status": "confirmed",
  "driver_details": {                      // ← When assigned
    "name": "John",
    "vehicle": "Black Tesla Model 3",
    "eta_minutes": 5
  },
  "fare": {
    "base_fare": 45.00,
    "discount": 4.50,                      // ← PP discount applied
    "final_fare": 40.50,
    "currency": "GBP"
  },
  "tracking_url": "https://taxi.app/track/TXI_9999"
}
```

#### UUID Mapping: How Systems Stay in Sync

The **Integration Service** maintains a mapping table to correlate bookings:

```
┌─────────────────────────────────────────────────────────┐
│              Booking Mapping Table                      │
├────────────────┬──────────────┬────────────────────────┤
│ pp_booking_id  │ taxi_booking │ status      │ updated  │
│ (UUID)         │ _id          │             │ _at      │
├────────────────┼──────────────┼─────────────┼──────────┤
│ uuid-1234-...  │ TXI_9999     │ in_progress │ 12:05:00 │
│ uuid-5678-...  │ TXI_8888     │ completed   │ 11:30:00 │
└────────────────┴──────────────┴─────────────┴──────────┘
```

**Why This Matters:**
1. **Webhooks**: When Taxi platform sends "driver assigned" webhook with `taxi_booking_id: TXI_9999`, Integration Service uses the mapping to find `pp_booking_id: uuid-1234` and update the correct PP user
2. **Status Queries**: PP app can query "What's the status of my booking?" using their UUID, Integration Service translates to Taxi's ID
3. **Cancellations**: If PP user cancels, Integration Service maps UUID → Taxi ID to call correct cancellation endpoint

#### Exposed Inventory: Membership Data

The Taxi Platform needs **minimal read access** to PP member data for:
- **Discount Calculation**: Validate membership tier (standard/prestige/prestige_plus)
- **Booking History**: Check if user qualifies for loyalty perks

**Implementation Options:**

**Option 1: Push Model (Recommended for MVP)**
- PP includes `membership_tier` in every booking request
- No additional API calls needed
- Simple, low-latency

**Option 2: Pull Model (Production Enhancement)**
```
Taxi Platform → Integration Service: GET /users/{user_id}/membership
Response: { "tier": "prestige", "valid_until": "2026-12-31" }
```

**What's NOT Shared:**
- ❌ Payment card details (each platform uses own payment gateway)
- ❌ Personal data beyond user_id (GDPR compliance)
- ❌ Internal business logic or pricing algorithms
- ❌ Direct database access (API-only communication)

#### Benefits of This Architecture

1. **Scalability**: Each platform can scale independently without affecting the other
2. **Flexibility**: Can swap Taxi partner (Uber → Lyft → Bolt) without changing PP core services
3. **Security**: 
   - No database credentials shared between platforms
   - No payment card data exposure to PP
   - Reduced attack surface (API-only integration)
4. **Maintainability**: 
   - Clear API contract between platforms
   - Integration logic isolated in single service
   - Easier to debug and test
5. **Multi-Partner Support**: PP could integrate with multiple taxi providers simultaneously using same integration pattern
6. **PCI Compliance**: PP avoids payment processing complexity and compliance burden (handled by Taxi Platform)
7. **Cost Efficiency**: Leverage Taxi Platform's existing infrastructure (drivers, vehicles, dispatch, payments) rather than building from scratch

**Architectural Pattern:** This is a **partner integration** model, not vertical integration. PP focuses on its core competency (airport lounge access) and partners with specialists (Taxi Platform for rides) via clean API boundaries.

---

## 🎨 Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **CSS3** - Styling (no external libraries for simplicity)
- **React Hooks** - State management

---

## 📂 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Timeline.tsx
│   │   └── StatusBadge.tsx
│   ├── flight/          # Flight-related components
│   │   └── FlightCard.tsx
│   ├── taxi/            # Taxi booking components
│   │   ├── TaxiBookingWidget.tsx
│   │   └── RecommendedTimeDisplay.tsx
│   └── lounge/          # Lounge components
│       ├── LoungeCard.tsx
│       └── LoungeList.tsx
├── pages/
│   └── TripPlannerPage.tsx    # Main application page
├── services/
│   ├── api/
│   │   └── mockData.ts        # Mock API data
│   └── utils/
│       └── timeCalculations.ts # Business logic
├── types/
│   └── index.ts               # TypeScript definitions
└── styles/
    ├── globals.css            # Global styles
    └── theme.ts               # Design system
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 16+** and **npm** installed on your machine
  - Check if installed: `node --version` and `npm --version`
  - Download from: [https://nodejs.org/](https://nodejs.org/)
- **Git** installed for cloning the repository
  - Check if installed: `git --version`

### Quick Start (3 Steps)

#### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/StephenRyall/collingson_client_solution_architect_test.git

# Navigate to project directory
cd collingson_client_solution_architect_test
```

#### 2. Install Dependencies

```bash
# Install all required packages
npm install
```

This will install React, TypeScript, and all dependencies (~2-3 minutes).

#### 3. Start the Application

```bash
# Start development server
npm start
```

The app will automatically open at [http://localhost:3000](http://localhost:3000)

### Alternative Commands

```bash
# Build for production
npm run build

# Run tests (if configured)
npm test
```

### First Time Setup Troubleshooting

**If you don't have Node.js:**
```bash
# macOS (using Homebrew)
brew install node

# Verify installation
node --version
npm --version
```

**If `npm install` fails:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

**If port 3000 is already in use:**
```bash
# The app will prompt to use a different port (e.g., 3001)
# Or manually kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 🔑 Key Design Decisions

### 1. Recommended Departure Time Algorithm

The system calculates optimal taxi pickup time using:

```typescript
pickup_time = flight_departure
              - security_buffer (90 min for international)
              - drive_time (from Google Maps API)
              - preparation_buffer (15 min)
```

**Example:**
- Flight departs: 14:30
- Security buffer: 90 min → Must be at airport by 13:00
- Drive time: 45 min → Leave home by 12:15
- Preparation: 15 min → **Pickup at 12:00**

### 2. Data Sharing Between Systems

**Priority Pass → Taxi App:**
- User ID (for linking accounts)
- Membership tier (for discount calculation)
- Flight details (for recommended time)

**Taxi App → Priority Pass:**
- Booking status
- Driver ETA
- Real-time tracking URL

**Payment Processing:**
- ✅ **Taxi Platform handles all payment processing** (not Priority Pass)
- ✅ User's payment method stored with Taxi Platform (e.g., saved Uber payment)
- ✅ Priority Pass **never sees or stores payment card data**
- ✅ PP remains **out of PCI compliance scope** (significant security/cost benefit)
- ✅ User sees charges from "Uber"/"Lyft" (clear, trusted brand)

### 3. Component Design

**Atomic Design Pattern:**
- **Atoms**: Button, StatusBadge
- **Molecules**: Card, Timeline
- **Organisms**: FlightCard, TaxiBookingWidget, LoungeList
- **Templates**: TripPlannerPage

---

## 🎯 MVP Features Implemented

### ✅ Completed
- [x] Flight information display with status badges
- [x] Recommended taxi departure time with visual timeline
- [x] Taxi booking widget with fare calculation
- [x] Priority Pass member discount (10% off)
- [x] Airport lounge listings (departure & arrival)
- [x] Responsive design (mobile & desktop)
- [x] Professional UI with Priority Pass branding

### 📋 Production Enhancements (Not Built)

**Core Infrastructure:**
- [ ] Real backend API integration
- [ ] User authentication & authorization (OAuth 2.0)
- [ ] Real-time driver tracking (WebSocket)
- [ ] Payment processing integration
- [ ] Email/SMS notifications
- [ ] Multi-currency support
- [ ] Accessibility (WCAG AA)

**Operational & Analytics Features:**
- [ ] **Operations Dashboard**: Admin interface for monitoring system health, booking volumes, and error rates
- [ ] **Fleet Management**: Driver availability tracking, route optimization, surge pricing management
- [ ] **Analytics & Reporting**: Business intelligence dashboards showing ride patterns, revenue metrics, and partnership performance
- [ ] **Customer Support Tools**: Dispute resolution, refund management, booking modification capabilities
- [ ] **Performance Monitoring**: Real-time alerting, error tracking (Sentry), APM (New Relic/Datadog)

**Why These Were Omitted:**
- Focus on **core user journey** and **technical architecture** for MVP demonstration
- Operational features don't showcase client-facing value proposition
- Time-constrained assessment prioritizes demonstrable user experience
- These features would be built in **Phase 2-3** (3-6 months post-MVP)

---

## 🛡️ Security Considerations

### PCI Compliance Strategy

**Key Decision: Taxi Platform Owns Payment Processing**

Priority Pass follows a **partner-managed payment model** to minimize PCI compliance burden:

1. **No Card Data Exposure**: 
   - PP **never receives, stores, or transmits** payment card data
   - User payment methods stored exclusively with Taxi Platform (Uber, Lyft, etc.)
   - PP is **SAQ A** compliant (simplest PCI category - out of scope for most requirements)

2. **Payment Flow**:
   - User links PP account to existing Uber/Lyft account (OAuth)
   - Or user enters payment in Taxi Platform's embedded form (data goes to Taxi, not PP)
   - Taxi Platform processes payment after ride completion
   - PP receives booking confirmation with fare amount only

3. **PCI Responsibility**:
   - **Taxi Platform**: Full PCI DSS compliance (Level 1 or SAQ D)
   - **Priority Pass**: SAQ A (no card data interaction)
   - Significantly reduces PP's security audit requirements and liability

4. **API Security**: 
   - TLS 1.3 for all communications
   - Service-to-service authentication via API keys
   - OAuth 2.0 for user authentication

5. **Audit Logging**: 
   - All booking transactions logged immutably
   - No payment card data in logs (only booking IDs and fare amounts)

### Data Privacy
- **Platform Separation**: Each platform maintains own database (no shared data stores)
- **Integration Service as Gatekeeper**: All cross-platform communication goes through Integration Service
- **Minimal Data Sharing**: Only user_id, membership_tier, and booking UUIDs cross platforms
- **GDPR Compliance**: No unnecessary PII shared between platforms
- **User Control**: Users manage payment methods directly with Taxi Platform

---

## 🏆 Trade-offs & Omissions

### MVP Shortcuts
1. **Mock Data**: Production would use real APIs
2. **Hard-coded Calculations**: Production would use ML for traffic-adjusted ETAs
3. **No Error Monitoring**: Would add Sentry in production
4. **Basic Styling**: Would add animations/micro-interactions

### How to Address in Production
- **Phase 2 (3 months)**: Real-time tracking, error monitoring, multi-currency
- **Phase 3 (6 months)**: ML-based ETA, predictive analytics, offline mode
- **Phase 4 (12 months)**: Global expansion, white-label solution

---

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: 320px - 768px (stacked layout)
- **Tablet**: 768px - 1024px (2-column grid)
- **Desktop**: 1024px+ (full grid layout)

---

## 🎨 Design System

### Colors
- **Primary**: #003B5C (Dark Blue - Priority Pass brand)
- **Secondary**: #FFB300 (Amber - Taxi accent)
- **Success**: #4CAF50
- **Warning**: #FF9800
- **Error**: #F44336

### Typography
- **Font**: System fonts (-apple-system, Segoe UI, etc.)
- **Headings**: 600 weight
- **Body**: 400 weight

### Spacing
- **8px grid system** (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px)

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Flight card displays correctly
- [x] Recommended time calculates properly
- [x] Taxi booking widget shows discount
- [x] Lounge cards display with correct info
- [x] Responsive layout works on mobile
- [x] Success message appears after booking
- [x] All links and buttons are clickable

### Future Testing
- Unit tests (Jest)
- Component tests (React Testing Library)
- E2E tests (Cypress)

---

## 👨‍💻 Author

Stephen Ryall  
Client Solutions Architect Technical Assignment  
Collinson Group

---

## 📄 License

This is a technical assessment project.
