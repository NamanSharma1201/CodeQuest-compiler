import express from "express";
import path from "path";
import dotenv from "dotenv";
import codeRouter from "./routes/code.js";
import makeFolders from "./services/makeFolders.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

makeFolders();

// Main router
app.use("/", codeRouter);

// Error handling middleware

app.listen(port, () => {
  console.log(`Online-Compiler running on port ${port}`);
});
