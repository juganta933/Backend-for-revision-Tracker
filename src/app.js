const express=require("express");
const authRoutes=require("../routes/authRoutes")
const probelmRoutes=require("../routes/ProblemRoutes")
const revisionRoutes = require("../routes/RevisonRoutes");
const cors = require("cors");
const app=express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            origin === "http://localhost:3000"
        ) {
            return callback(null, true);
        }
        return callback(null, true); // fallback to allow credentials in dev/staging
    },
    credentials: true
}));
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Dsa revision Tracker is Running");
})
app.use("/api/auth",authRoutes);
app.use("/api/revisions", revisionRoutes);
app.use("/api/problems",probelmRoutes);

module.exports=app;
