import express from 'express'
import { handleLogin, handleSignup, getProfile,handleSendOtp,handleVerifyOtp  } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const userRouter = express.Router();


userRouter.post('/signup', handleSignup);

userRouter.post('/login', handleLogin);


userRouter.get('/profile', authMiddleware(), getProfile);

userRouter.post('/sendotp', handleSendOtp);
userRouter.post('/verifyotp', handleVerifyOtp);

export default userRouter;