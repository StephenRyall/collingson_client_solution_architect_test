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

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (This App)                  │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Flight    │  │   Taxi     │  │  Lounge    │       │
│  │ Components │  │ Components │  │ Components │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │       Trip Planner Page (Main View)          │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Services (Not Built)                │
│                                                          │
│  • Integration Service (Orchestrator)                    │
│  • Flight Data Service                                   │
│  • Taxi Booking Service                                  │
│  • User/Auth Service                                     │
│  • Notification Service                                  │
└─────────────────────────────────────────────────────────┘
```

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
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will open at [http://localhost:3000](http://localhost:3000)

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

**PCI Compliance:**
- ✅ No payment card data shared between platforms
- ✅ Each system maintains own payment gateway
- ✅ Only payment tokens exchanged

### 3. Component Design

**Atomic Design Pattern:**
- **Atoms**: Button, StatusBadge
- **Molecules**: Card, Timeline
- **Organisms**: FlightCard, TaxiBookingWidget, LoungeList
- **Templates**: TripPlannerPage

---

## 📊 Data Models

### User
```typescript
{
  userId: string;
  membershipTier: 'standard' | 'prestige' | 'prestige_plus';
}
```

### Flight
```typescript
{
  flightNumber: string;
  departureAirport: string;  // IATA code
  arrivalAirport: string;
  departureTime: string;     // ISO 8601
  terminal: string;
  status: 'upcoming' | 'departed' | 'cancelled';
}
```

### TaxiBooking
```typescript
{
  pickupAddress: string;
  pickupTime: string;
  estimatedFare: number;
  discountApplied: number;   // PP member discount
  status: 'pending' | 'confirmed' | 'in_progress';
}
```

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
- [ ] Real backend API integration
- [ ] User authentication & authorization
- [ ] Real-time driver tracking (WebSocket)
- [ ] Payment processing integration
- [ ] Email/SMS notifications
- [ ] Multi-currency support
- [ ] Accessibility (WCAG AA)
- [ ] Analytics tracking

---

## 🛡️ Security Considerations

### PCI Compliance Strategy
1. **No Card Data Storage**: Payment handled by PCI-compliant gateway (Stripe/Adyen)
2. **Tokenization**: Store only payment tokens, never raw card data
3. **Data Segregation**: Payment data isolated in separate systems
4. **API Security**: TLS 1.3 for all communications
5. **Audit Logging**: All transactions logged immutably

### Data Privacy
- Taxi Manager sees aggregated data only (e.g., "PP Member #12345", not "John Smith")
- Cross-system queries go through Integration Service (gatekeeper)
- GDPR-compliant data handling

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

## 📝 Notes for Presentation

### Key Points to Highlight
1. **Clean Architecture**: Separation of UI, business logic, and data
2. **Type Safety**: TypeScript prevents runtime errors
3. **Reusability**: Common components used throughout
4. **Scalability**: Designed for future backend integration
5. **User-Centric**: Focused on traveler experience

### Demo Flow
1. Show flight information with status
2. Explain recommended departure time algorithm
3. Demo taxi booking with discount
4. Show lounge availability
5. Click "Book Taxi" to see success message

---

## 👨‍💻 Author

Stephen Ryall  
Client Solutions Architect Technical Assignment  
Collinson Group

---

## 📄 License

This is a technical assessment project.
