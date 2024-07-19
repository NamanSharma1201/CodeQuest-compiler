import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.js";
import problemRouter from "./routes/problem.js";
import commentRouter from "./routes/comments.js";
import blogRouter from "./routes/blogs.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/problem", problemRouter);
app.use("/blog", blogRouter);
app.use("/comment", commentRouter);

app.listen(port, () => {
  console.log(`API server running on port ${port} ....`);
});
