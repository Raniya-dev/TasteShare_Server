import express from "express"
import dotenv from "dotenv"
import ConnectDB from "./config/dbConnection.js"
import userRouter from "./routes/authRoutes.js"
import cors from "cors"
import nodemailer from 'nodemailer'
import cookieParser from "cookie-parser"
import recipeRouter from './routes/recipeRoutes.js';
import mealdbapiRouter from "./routes/mealdbapiRoutes.js"
import chatRouter from "./routes/chatbotRoutes.js"


dotenv.config()

import cloudinary from "./config/cloudinary.js";

const app = express()
ConnectDB()



app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);




app.use(express.urlencoded({extended:true}))

app.get("/",(req,res)=>{
    res.send("hello recipefinder")
})


app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
})


app.use(express.json())
app.use('/api/auth', userRouter)
app.use('/api/recipes', recipeRouter)
app.use('/api/mealdb', mealdbapiRouter)
app.use('/api/chat', chatRouter)

app.use(
  "/uploads",
  express.static("uploads")
);

app.use(cookieParser())



const PORT = process.env.PORT || 5001
app.listen(PORT,()=>{
    console.log(`the server is running in ${PORT}`);
  
})