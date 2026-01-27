import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload"; 
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import adminRoutes from "./routes/admin.js";
import tricksRouter from "./routes/trick.js";
import ticketsRouter from "./routes/tickets.js"
import { initDB } from "./db.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(fileUpload());

app.use("/uploads", express.static("uploads")); 
app.use("/api/tricks", tricksRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/auth", authRoutes); 
app.use("/api/profile", profileRoutes); 
app.use("/api/admin", adminRoutes); 
app.use("/api", adminRoutes); 

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize DB:", err);
  });


