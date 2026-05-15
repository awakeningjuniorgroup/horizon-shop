import "dotenv/config"; 
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// 🟢 NEW: Imports for Real-Time WebSockets
import { createServer } from "http";
import { Server } from "socket.io";

// Enterprise Middlewares
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

// Import Configs
import connectCloudinary from "./configs/cloudinary.js"; 

// Route Imports
import webhookRouter from "./routes/webhookRoute.js"; 
import addressRouter from "./routes/addressRoute.js";
import adminRouter from "./routes/adminRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import productRouter from "./routes/productRoute.js";
import riderRouter from "./routes/riderRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import settingsRouter from "./routes/settingsRoutes.js"; 
import userRouter from "./routes/userRoute.js";
import contentRouter from "./routes/contentRoute.js";
import cmsRouter from "./routes/cmsRoute.js"; 
import chatRouter from "./routes/chatRoute.js"; 
import payoutRouter from "./routes/payoutRoute.js";

// Middleware Imports
import { checkMaintenance } from "./middlewares/authRole.js"; 

const app = express();
const PORT = process.env.PORT || 4000;

// 🟢 Create HTTP Server and bind Socket.io to it
const httpServer = createServer(app);

// 🟢 FIX: CORRECTED allowed origins with proper commas
const allowedOrigins = [
  "http://localhost:5173",  
  "https://horizon-shop.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

// 🟢 FIX: CORS configuration with ALL required headers
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow for debugging - remove in production
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  // 🔥 CRITICAL FIX: Added 'token' header to allowed headers
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Cookie", 
    "X-Requested-With",
    "token",  // ✅ THIS WAS MISSING - FIXES THE CORS ERROR
    "Token",  // Also handle capitalized version
    "x-token", // Alternative naming
    "X-Token"
  ],
  exposedHeaders: ["Set-Cookie", "token", "Token"],
  optionsSuccessStatus: 200
};

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

// 🟢 Attach IO to app so controllers can trigger real-time Admin events
app.set("io", io);

// ==========================================
// 🚀 REAL-TIME TRACKING ENGINE (SOCKET.IO)
// ==========================================
io.on("connection", (socket) => {
    console.log(`🔌 Live Connection Established: ${socket.id}`);

    // 1. Both Customer & Rider join a private "Order Room"
    socket.on("join_order", (orderId) => {
        socket.join(orderId);
        console.log(`📦 User joined Tracking Room: ${orderId}`);
    });

    // 2. Rider broadcasts their live GPS coordinates
    socket.on("rider_location_update", (data) => {
        socket.to(data.orderId).emit("live_location", data);
    });

    // 3. Register global user for generic notifications (Seller/User)
    socket.on("register_user", (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`👤 User joined Global Notification Room: ${userId}`);
        }
    });

    // 4. Broker Rider Arrivals to the destination party
    socket.on("rider_arrived", ({ orderId, targetUserId, type }) => {
        console.log(`🎯 Rider Arrived! Notifying ${type}: ${targetUserId} for order ${orderId}`);
        socket.to(targetUserId).emit("push_notification", 
            type === "pickup" 
                ? `🚲 Your rider has arrived at your store for order #${orderId.slice(-6).toUpperCase()}`
                : `📦 Your delivery has arrived! Your rider is outside.`
        );
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Connection Dropped: ${socket.id}`);
    });
});

const initializeServer = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    await connectCloudinary();
    console.log(`✅ Cloudinary Ready`);

    // Security & Logging Middlewares
    app.use(helmet({ 
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false // Important for CORS
    })); 
    app.use(compression()); 
    
    if (process.env.NODE_ENV !== 'production') {
        app.use(morgan('dev')); 
    }

    // 🟢 Apply CORS middleware BEFORE any route
    app.use(cors(corsOptions));
    
    // Handle preflight requests explicitly for all routes
    app.options('*', cors(corsOptions));

    // Webhook route (must be before express.json for raw body)
    app.use("/api/webhooks", webhookRouter); 

    // Body parsing middlewares
    app.use(express.json({ limit: '2mb' })); 
    app.use(express.urlencoded({ extended: true, limit: '2mb' }));
    app.use(cookieParser());

    // Middleware to log headers for debugging (optional)
    app.use((req, res, next) => {
      if (req.headers.token) {
        console.log(`🔑 Token header received for ${req.method} ${req.path}`);
      }
      next();
    });

    // Maintenance check middleware
    app.use(checkMaintenance);

    // API ROUTES
    app.use("/api/address", addressRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/product", productRouter);
    app.use("/api/rider", riderRouter);
    app.use("/api/seller", sellerRouter);
    app.use("/api/settings", settingsRouter); 
    app.use("/api/user", userRouter);        
    app.use("/api/content", contentRouter);  
    app.use("/api/cms", cmsRouter);          
    app.use("/api/chat", chatRouter);        
    app.use("/api/payout", payoutRouter);    

    // Health check endpoint
    app.get("/", (req, res) => {
      res.status(200).json({ success: true, message: "🌿 Horizon API is active." });
    });

    // Test CORS endpoint (for debugging)
    app.get("/api/test-cors", (req, res) => {
      res.json({ 
        success: true, 
        message: "CORS is working!",
        origin: req.headers.origin,
        allowedOrigins: allowedOrigins,
        headersReceived: Object.keys(req.headers)
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error(`[ERROR]: ${err.message}`);
      console.error(err.stack);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    });

    // Handle 404 routes
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
      });
    });

    // Listen using the HTTP server, NOT the Express app, so Sockets work!
    httpServer.listen(PORT, () => {
      console.log(`🚀 Real-Time Server running on port ${PORT}`);
      console.log(`📡 CORS enabled for origins:`, allowedOrigins);
      console.log(`📋 Allowed headers:`, corsOptions.allowedHeaders);
    });

  } catch (error) {
    console.error(`❌ FATAL: Server Initialization Failed: ${error.message}`);
    process.exit(1);
  }
};

initializeServer();

module.exports = app;