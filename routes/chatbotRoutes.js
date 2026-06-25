import express from "express";
import { chatBot } from "../controllers/chatbotController.js";

const chatRouter = express.Router();

chatRouter.post("/", chatBot);

export default chatRouter;