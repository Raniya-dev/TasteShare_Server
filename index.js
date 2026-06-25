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

// ✅ CORS (ONLY ONCE, BEFORE ROUTES)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

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

// const transporter = nodemailer.createTransport({
//   service:'gmail',
//   host:'smtp.gmail.com',
//   port:587,
//   secure:false,
//   auth:{
//     user:process.env.EMAIL,
//     pass:process.env.PASSWORD
//   }
// })

// const mailOptions = {
//   from:process.env.EMAIL,
//   to:process.env.EMAIL,
//   subject:'Test Email from Node.js',
//   text:'this is a test email sent from the recipe finder backend'
// }

// app.get("/sendemail", async (req, res) => {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: process.env.EMAIL,
//       subject: "Welcome to Recipe Finder",
//       text: "Welcome to Recipe Finder!"
//     });

//     res.json({ message: "Email sent", info });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


const PORT = process.env.PORT || 5001
app.listen(PORT,()=>{
    console.log(`the server is running in ${PORT}`);
  
})