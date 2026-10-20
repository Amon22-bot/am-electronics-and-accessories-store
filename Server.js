
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// IMPORTANT: Your folder is named "Routes" with a capital R.
const productRoutes = require("./productRoutes");
const orderRoutes = require("./orderRoutes");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Local origins keep the existing development workflow working. Add hosted
// frontend origins in FRONTEND_ORIGINS as a comma-separated list.
const allowedOrigins = new Set([
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    ...(process.env.FRONTEND_ORIGINS || "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
]);

const corsOptions = {
    origin(origin, callback) {
        // Requests without an Origin header are non-browser health checks.
        // File previews use the opaque "null" origin only in local development.
        if (!origin || allowedOrigins.has(origin) ||
            (origin === "null" && process.env.NODE_ENV !== "production")) {
            return callback(null, true);
        }
        return callback(new Error("This website origin is not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "8mb" }));

// Socket.IO configuration
const io = new Server(server, {
    cors: corsOptions
});

// Make Socket.IO available to route handlers if needed
app.set("io", io);

// Health-check route for local and hosted uptime checks.
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AM Electronics backend is running."
    });
});

// Product API routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// This service hosts the API. Deploy the frontend as a separate Render Static Site.
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AM Electronics API is running.",
        health: "/health"
    });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("A client disconnected:", socket.id);
    });
});

// Start the server only after MongoDB connects
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI is missing. Check your server/.env configuration."
            );
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Successfully connected to MongoDB.");

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`AM Electronics backend running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Backend startup failed:", error.message);
        process.exitCode = 1;
    }
}

startServer();



