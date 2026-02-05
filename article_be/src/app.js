// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import articleRoutes from "./routes/article.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import activityRoutes from './routes/activity.routes.js'
import profileRoutes from "./routes/profile.routes.js";

const app = express();

/* ========================
GLOBAL MIDDLEWARE
======================== */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  '/api/uploads',
  express.static('uploads', {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store')
    },
  })
)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());

/* ========================
HEALTH CHECK
======================== */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Article API is running",
  });
});

/* ========================
ROUTES
======================== */
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/activity', activityRoutes)
app.use("/api/profile", profileRoutes);
app.use("/api/uploads", express.static("uploads"));
/* ========================
   404 HANDLER
======================== */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* ========================
   ERROR HANDLER
======================== */
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal Server Error",
  });
});

export default app;
