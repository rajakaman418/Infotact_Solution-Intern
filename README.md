##LIVE DEMO: https://infotact-solution-intern-1.onrender.com
# 🧾 Retail POS System (MERN Stack)

A complete **Retail Point of Sale (POS) System** built using **Node.js, Express, MongoDB, Redis, and React (Vite)**.

This system enables **inventory management, order processing, real-time analytics, and invoice generation** in a scalable and production-ready architecture.

---

# 🚀 Features

## 🛒 POS System
- Add products to cart
- Real-time cart updates
- Checkout orders
- Auto stock deduction
- Invoice generation (PDF)
- Print & download invoice

## 📦 Inventory Management
- Add stock to products
- Track stock per store
- Inventory ledger tracking
- Low stock alerts

## 📊 Dashboard (Real-Time)
- Total revenue & orders
- Daily sales trend (charts)
- Top-selling products
- Auto-refresh dashboard

## 📋 Orders Management
- List all orders
- View single order
- Refund functionality
- Order status tracking

## 🏷️ Product Management
- Full CRUD operations
- Product variants (size, color, SKU)
- Pagination & filtering

---

# 🧱 Tech Stack

## 🔙 Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis (Caching)
- JWT Authentication
- PDFKit (Invoice)

## 🎨 Frontend
- React (Vite)
- Axios
- Recharts (Charts)
- Context API (Cart State)

---

# 📁 Project Structure

## Backend

backend/
  src/
    config/
      db.js
      redis.js

    controllers/
      auth.controller.js
      product.controller.js
      order.controller.js
      inventory.controller.js
      report.controller.js
      invoice.controller.js

    models/
      User.js
      Product.js
      Order.js
      Inventory.js

    routes/
      auth.routes.js
      product.routes.js
      order.routes.js
      inventory.routes.js
      report.routes.js
      invoice.routes.js

    middleware/
      auth.middleware.js

    services/
      invoice.service.js
      report.service.js

    app.js

---

## Frontend

frontend/
  src/
    api/
      client.js
      auth.api.js
      product.api.js
      order.api.js
      inventory.api.js
      report.api.js
      dashboard.api.js

    components/
      layout/
        AppShell.jsx
        Sidebar.jsx
        Topbar.jsx

      pos/
        ProductGrid.jsx
        ProductCard.jsx
        CartPanel.jsx
        CartItem.jsx

      dashboard/
        StatCard.jsx

    context/
      CartContext.jsx

    pages/
      LoginPage.jsx
      DashboardPage.jsx
      POSPage.jsx
      OrdersPage.jsx
      ProductsPage.jsx
      AddStockPage.jsx

    routes/
      AppRouter.jsx

    styles/
      app.css
      layout.css
      pos.css
      dashboard.css

---

# ⚙️ Environment Variables

## Backend (.env)

PORT=5000  
MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_secret_key  
REDIS_URL=redis://127.0.0.1:6379  

---

# 🐳 Docker Setup (Recommended)

Run MongoDB & Redis:

docker run -d -p 27017:27017 --name mongo mongo  
docker run -d -p 6379:6379 --name redis redis  

I have not added yet. Looking to add it on Future
---

# ▶️ Running the Project

## 1️⃣ Backend

cd backend  
npm install  
npm start  

Runs on:  
http://localhost:5000  

---

## 2️⃣ Frontend

cd frontend  
npm install  
npm run dev  

Runs on:  
http://localhost:5173  

---

# 🔗 API Integration

## Axios Client

const client = axios.create({
  baseURL: "http://localhost:5000/api",
});

## Auth Flow

1. Login → receive JWT token  
2. Store token in localStorage  
3. Axios attaches token automatically  

Authorization: Bearer TOKEN  

---

# 🧪 API Endpoints

## Auth
POST /api/auth/login  

## Products
GET    /api/products  
POST   /api/products  
PUT    /api/products/:id  
DELETE /api/products/:id  

## Orders
POST /api/orders/checkout  
GET  /api/orders  
GET  /api/orders/:id  
POST /api/orders/:id/refund  

## Inventory
POST /api/inventory/add  
GET  /api/inventory/stock  
GET  /api/inventory/ledger  

## Reports
GET /api/reports/sales  

## Invoice
GET /api/invoices/:orderId/pdf  

---

# 📊 Dashboard

- Sales summary
- Revenue tracking
- Charts (Recharts)
- Top products
- Auto-refresh (15 seconds)

---

# 🧾 Invoice System

- PDF generation
- Download invoice
- Print invoice
- Linked to orders

---

# 🔄 Real-Time Updates

- Dashboard auto-refresh
- Cart updates instantly
- Inventory updates after checkout

---

# ⚠️ Common Issues

## Redis Error
ECONNREFUSED 127.0.0.1:6379  
→ Start Redis or Docker container  

## CORS Error
Ensure backend:
app.use(cors());

## 401 Unauthorized
→ Token missing or expired  

## Charts Not Showing
→ Ensure data exists  
→ Add stroke / fill colors  

---

# 🏁 Future Improvements

- Toast notifications
- Advanced analytics filters
- Thermal receipt printing
- Multi-store UI
- WebSocket real-time updates

---

# 👨‍💻 Author

Dibakar Rajak

---




