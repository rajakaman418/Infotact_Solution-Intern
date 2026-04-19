####LIVE PREVIEW= https://infotact-solution-intern-1.onrender.com

🧾 Retail POS System (MERN Stack)
A full-featured Retail Point of Sale (POS) System built with Node.js, Express, MongoDB, and React (Vite).
This system supports product management, inventory tracking, order processing, invoice generation, and real-time dashboard analytics.

🚀 Features
🛒 POS (Point of Sale)


Add products to cart


Checkout orders


Auto stock deduction


Invoice generation (PDF)


Print & download invoice


📦 Inventory Management


Add stock


Track stock per store


Low stock detection


Inventory ledger tracking


📊 Dashboard


Sales summary


Daily sales trend (charts)


Top-selling products


Auto-refresh (real-time updates)


📋 Orders


Order list


View single order


Refund orders


Status tracking (completed, refunded)


🏷️ Products


Create, Read, Update, Delete (CRUD)


Variants (size, color, SKU)


Pagination & filtering



🧱 Tech Stack
Backend


Node.js


Express.js


MongoDB (Mongoose)


Redis (caching)


JWT Authentication


PDFKit (invoice generation)


Frontend


React (Vite)


Axios


Recharts (charts)


Context API (cart state)



📁 Project Structure
backend/  src/    controllers/    models/    routes/    services/    config/    middleware/    app.jsfrontend/  src/    api/    components/    context/    pages/    routes/    styles/

⚙️ Environment Variables
Backend .env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
REDIS_URL=redis://127.0.0.1:6379

▶️ Running the Project
1️⃣ Backend
cd backendnpm installnpm start
Server runs at:
http://localhost:5000

2️⃣ Frontend
cd frontendnpm installnpm run dev
Frontend runs at:
http://localhost:5173

🔗 API Base URL
http://localhost:5000/api

🔑 Authentication Flow


Login → receive JWT token


Store token in localStorage


Axios automatically attaches token:


Authorization: Bearer TOKEN

🧪 Key API Endpoints
Auth
POST /api/auth/login
Products
GET    /api/productsPOST   /api/productsPUT    /api/products/:idDELETE /api/products/:id
Orders
POST /api/orders/checkoutGET  /api/ordersGET  /api/orders/:idPOST /api/orders/:id/refund
Inventory
POST /api/inventory/addGET  /api/inventory/stockGET  /api/inventory/ledger
Reports
GET /api/reports/sales
Invoice
GET /api/invoices/:orderId/pdf

📊 Dashboard Features


Total revenue


Total orders


Today’s revenue


Low stock count


Daily sales chart


Top products chart



🧾 Invoice Features


PDF generation


Download invoice


Print invoice


Linked to order



🔄 Real-Time Updates
Dashboard auto-refresh every 15 seconds.

⚠️ Common Issues & Fixes
Redis Error
ECONNREFUSED 127.0.0.1:6379
👉 Start Redis or disable cache fallback.

CORS Error
Ensure backend has:
app.use(cors());

Unauthorized (401)


Token missing or expired


Check Authorization header



Chart Not Showing


Ensure data exists


Add stroke / fill colors in charts



🏁 Future Improvements


🔔 Toast notifications


📉 Advanced analytics filters


🧾 Thermal receipt printing


📦 Multi-store support UI


📊 Real-time WebSocket updates



👨‍💻 Author
Dibakar Rajak

⭐ If you like this project
Give it a ⭐ on GitHub!



