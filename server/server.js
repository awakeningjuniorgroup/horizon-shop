import "dotenv/config"; 
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// Imports pour Real-Time WebSockets
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
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

const httpServer = createServer(app);

const allowedOrigins = [
  process.env.VITE_BACKEND_URL,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://horizon-business-1.onrender.com/",
  "https://horizon-business.vercel.app"
].filter(Boolean);

// Configuration Socket.io (Désactivé sur Vercel car non supporté en Serverless)
const io = isVercel
  ? null
  : new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    });

if (io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Connection: ${socket.id}`);
    socket.on("join_order", (orderId) => socket.join(orderId));
    socket.on("disconnect", () => console.log("🔌 Disconnected"));
  });
}

app.set("io", io);

// --- MIDDLEWARES GLOBAUX ---
app.use(helmet()); 
app.use(compression()); 
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev')); 
}

app.use(cors({
  origin: allowedOrigins, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Webhook avant le body parser
app.use("/api/webhooks", webhookRouter); 

app.use(express.json({ limit: '2mb' })); 
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(checkMaintenance);

// --- ROUTES API (Déplacées hors de l'async pour Vercel) ---
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

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Horizon business API is active." });
});

// --- GESTION DES ERREURS ---
app.use((err, req, res, next) => {
  console.error(`[ERROR]: ${err.message}`);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message,
  });
});

// --- INITIALISATION CONNEXIONS ---
const initializeServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected`);
    await connectCloudinary();
    console.log(`✅ Cloudinary Ready`);

    if (!isVercel) {
      httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error(`❌ FATAL: ${error.message}`);
  }
};

initializeServer();

// Important : Export par défaut pour Vercel
export default app;