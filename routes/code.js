import { Router } from "express";
import { executeCode } from "../controllers/code.js";
import {
  executeCodeRemote,
  submitCodeRemote,
} from "../controllers/remoteCode.js";
const codeRouter = Router();

codeRouter.get("/", (req, res) => {
  res.redirect("/home");
});
codeRouter.get("/home", (req, res) => {
  res.render("home");
});

codeRouter.post("/run", executeCode);
codeRouter.post("/api/run", executeCodeRemote);
codeRouter.post("/api/submit", submitCodeRemote);

export default codeRouter;
