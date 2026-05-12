# FoodieHub — Integrated Food Delivery & Dine-Out Hospitality Platform

## 🚀 Project Overview

FoodieHub is a full-stack MERN application implementing the integrated food delivery and dine-out hospitality platform. Built with React, Node.js, Express, MongoDB, and Socket.io.

## 📁 Project Structure

```
FOOD APP/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/             # Axios instance with JWT interceptors
│   │   ├── components/      # Reusable components (Navbar, CartSidebar, etc.)
│   │   ├── context/         # React Context (Auth, Cart)
│   │   ├── pages/           # All page components
│   │   ├── socket/          # Socket.io client
│   │   └── App.jsx          # Router & providers
│   └── vite.config.js       # Vite config with proxy
│
└── server/                  # Node.js + Express backend
    ├── src/
    │   ├── config/          # MongoDB connection
    │   ├── controllers/     # Business logic
    │   ├── middleware/       # JWT auth middleware
    │   ├── models/          # Mongoose schemas
    │   ├── routes/          # API routes
    │   ├── socket/          # Socket.io event handler
    │   └── utils/           # DB seeder
    └── index.js             # Server entry point
```

## ⚡ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. MongoDB Setup
1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Whitelist your IP: **Network Access → Add IP Address**
3. Create a database user: **Database Access → Add New Database User**
4. Get connection string: **Clusters → Connect → Connect your application**
5. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/foodapp?retryWrites=true&w=majority
   ```

### 2. Backend Setup
```bash
cd server
npm install
node index.js
```
Server runs at: `http://localhost:5000`

**The database auto-seeds with 5 Bangalore restaurants on first run!**

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

## 🎯 Key Features Implemented

### Week 1 — ✅ Foundation
- [x] MongoDB Atlas with `2dsphere` geospatial indexing
- [x] User, Restaurant, Order, Review schemas with GeoJSON
- [x] JWT authentication (register, login, profile)
- [x] Environment variable management

### Week 2 — ✅ Discovery & Real-Time
- [x] `$geoNear` aggregation pipeline for proximity search
- [x] Composite rating+distance scoring algorithm
- [x] Cart state management (multi-restaurant conflict detection)
- [x] Socket.io WebSocket server with JWT auth
- [x] ORDER_PREPARING, COURIER_ASSIGNED event broadcasting

### Week 3 — ✅ Checkout & Gamification
- [x] Simulated payment gateway (card, UPI, COD, wallet)
- [x] Gamified Review Engine (word count + keyword density + media bonus scoring)
- [x] AI keyword suggestion system (NLP-based contextual keywords)
- [x] Loyalty points + badge system
- [x] Review quality tiers: Bronze → Silver → Gold → Platinum

### Week 4 — ✅ Merchant Dashboard & Optimization
- [x] Merchant Dashboard with real-time new order alerts via WebSocket
- [x] Order status action buttons (Accept/Reject/Prepare/Ready)
- [x] Menu item availability toggle
- [x] Daily revenue analytics with aggregation pipeline
- [x] MongoDB indexes: `2dsphere`, rating, cuisine type

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/nearby?lat=&lng=&maxDistance=` | **Geospatial search** |
| GET | `/api/restaurants` | List all restaurants |
| GET | `/api/restaurants/:id` | Restaurant details |
| POST | `/api/restaurants` | Create restaurant |
| PATCH | `/api/restaurants/:id/menu/:itemId/toggle` | Toggle item availability |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (with simulated payment) |
| GET | `/api/orders` | Get user orders |
| GET | `/api/orders/:id` | Get order details |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/restaurant/:id/analytics` | Revenue analytics |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit review (gamified) |
| GET | `/api/reviews/suggestions/:orderId` | AI keyword suggestions |
| GET | `/api/reviews/restaurant/:id` | Restaurant reviews |

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `JOIN_ORDER_ROOM` | Client→Server | Join order tracking room |
| `JOIN_RESTAURANT_ROOM` | Client→Server | Join restaurant dashboard room |
| `ORDER_STATUS_UPDATE` | Server→Client | Order status change broadcast |
| `NEW_ORDER` | Server→Client | New order alert for merchant |
| `COURIER_LOCATION_UPDATE` | Client→Server | Courier sends GPS coordinates |
| `COURIER_LOCATION` | Server→Client | Live courier location broadcast |

## 🎮 Gamified Review Scoring

```
Points = Word Points + Keyword Points + Media Bonus

Word Points = min(floor(wordCount / 10) * 5, 50)
Keyword Points = min(keywordsFound * 5, 30)
Media Bonus = 20 if images uploaded else 0

Tiers:
- Bronze:   0-29 points
- Silver:   30-54 points
- Gold:     55-79 points
- Platinum: 80+ points
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, React Router, Socket.io-client |
| Styling | Vanilla CSS with custom design system |
| Backend | Node.js + Express.js |
| Database | MongoDB (with 2dsphere geospatial index) |
| Real-time | Socket.io (WebSockets) |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS, Rate Limiting |

## 🌐 Demo Accounts (after seeding)
- **Consumer:** `user@foodapp.com` / `password123`
- **Restaurant:** `owner@foodapp.com` / `password123`
