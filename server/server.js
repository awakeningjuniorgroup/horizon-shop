import "dotenv/config"; 
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

// Enterprise Middlewares
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

// Configs & Routes
import connectCloudinary from "./configs/cloudinary.js"; 
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
import { checkMaintenance } from "./middlewares/authRole.js"; 

const app = express();
const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

// 🟢 CONFIGURATION DES ORIGINES
const allowedOrigins = [
  "http://localhost:5173",   
  "https://horizon-shop.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

// 🟢 CONFIGURATION CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Cookie", 
    "X-Requested-With",
    "token", "Token", "x-token", "X-Token"
  ],
  exposedHeaders: ["Set-Cookie", "token"],
  optionsSuccessStatus: 200
};

// 🟢 SOCKET.IO SETUP
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});
app.set("io", io);

io.on("connection", (socket) => {
    console.log(`🔌 Live: ${socket.id}`);

    socket.on("join_order", (orderId) => socket.join(orderId));
    
    socket.on("rider_location_update", (data) => {
        socket.to(data.orderId).emit("live_location", data);
    });

    socket.on("register_user", (userId) => {
        if (userId) socket.join(userId);
    });

    socket.on("disconnect", () => console.log(`🔌 Disconnected: ${socket.id}`));
});

// ==========================================
// 🚀 INITIALISATION DU SERVEUR
// ==========================================

const startServer = async () => {
  try {
    // Connexion DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
    await connectCloudinary();

    // Middlewares globaux
    app.use(helmet({ crossOriginResourcePolicy: false })); 
    app.use(compression()); 
    if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));

    // Routes spécifiques
    app.use("/api/webhooks", webhookRouter); 
    app.use(express.json({ limit: '2mb' })); 
    app.use(express.urlencoded({ extended: true, limit: '2mb' }));
    app.use(cookieParser());
    app.use(checkMaintenance);

    // API Routes
    app.use("/api/address", addressRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/product", productRouter);
    app.use("/api/rider", riderRouter);
    app.use("/api/seller", sellerRouter);
    app.use("/api/settings", settingsRouter); 
    app.use("/api/user", userRouter);        
    app.use("/api/chat", chatRouter);        

    // Health Check
    app.get("/", (req, res) => {
      res.status(200).json({ success: true, message: "🌿 Horizon API is active." });
    });

    // Error Handling
    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({ success: false, message: err.message });
    });

    // Lancement du listener (uniquement hors production ou sur serveur classique)
    if (process.env.NODE_ENV !== 'production') {
      httpServer.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    }

  } catch (error) {
    console.error(`❌ Fatal Error: ${error.message}`);
  }
};

startServer();

// 🛑 IMPORTANT POUR VERCEL
export default app;