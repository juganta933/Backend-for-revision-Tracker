const express=require("express");
const authRoutes=require("../routes/authRoutes")
const probelmRoutes=require("../routes/ProblemRoutes")
const revisionRoutes = require("../routes/RevisonRoutes");
const cors = require("cors");
const app=express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Dsa revision Tracker is Running");
})
app.use("/api/auth",authRoutes);
app.use("/api/revisions", revisionRoutes);
app.use("/api/problems",probelmRoutes);

module.exports=app;
