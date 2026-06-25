import { userModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'



//  Signup new user
const handleSignup = async (req, res) => {
    try {
        const { username, email, password } = req.body;


        if (!username || username.trim().length === 0)
            return res.status(400).json({ errMsg: "username is required" });
        if (!email || email.trim().length === 0)
            return res.status(400).json({ errMsg: "email is required" });
        if (!password || password.length < 6)
            return res.status(400).json({ errMsg: "password must be at least 6 characters" });


        const existingUser = await userModel.findOne({ email: email });

        console.log("Existing user:", existingUser)


        if (existingUser) {
            return res.status(400).json({ errMsg: "Email already registered and user exists" });
        }

        console.log("Password before hashing:", password);


        const hashedPassword = await bcrypt.hash(password, 10)
        console.log("password after hashing", hashedPassword);


        // Create new user
        const newUser = await userModel.create({
            name: username,
            email: email,
            password: hashedPassword

        });

        return res.status(201).json({
            message: "User created successfully",
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ errMsg: "Server Error" });
    }
};

//  user login
const handleLogin = async (req, res) => {
    try {
        console.log("API reached.");
        const { email, password } = req.body;



        if (!email || email.trim().length === 0)
            return res.status(400).json({ errMsg: "email is required" });
        if (!password || password.length < 2)
            return res.status(400).json({ errMsg: "valid password is required" });


        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ errMsg: "user not found" });
        }


        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ errMsg: "invalid password" })
        }
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            user: { name: user.name, email: user.email },
            token: token,
            message: "login success"
        });


    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ errMsg: "Server Error" });
    }
};



const getProfile = async (req, res, next) => {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("-password");

        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            return next(err);
        }

        return res.status(200).json({
            message: "User profile",
            user
        });

    } catch (error) {
        next(error);
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const handleSendOtp = async (req, res) => {
    try {
        const { email } = req.body;

       
        if (!email || email.trim().length === 0) {
            return res.status(400).json({ errMsg: "Email is required" });
        }

        // Debug: Check if env variables exist
        if (!process.env.EMAIL || !process.env.PASSWORD) {
            console.error("Missing EMAIL or PASSWORD in .env file");
            return res.status(500).json({ errMsg: "Server configuration error" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ errMsg: "User not found" });
        }

        const otp = generateOtp();

        user.resetOtp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP for Password Reset",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            errMsg: "Server Error"
        });
    }
};





const handleVerifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1. Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        errMsg: "Email, OTP and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        errMsg: "Password must be at least 6 characters"
      });
    }

    // 2. Find user
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        errMsg: "User not found"
      });
    }

    // 3. Check OTP match
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({
        errMsg: "Invalid OTP"
      });
    }

    // 4. Check OTP expiry
    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        errMsg: "OTP expired"
      });
    }

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update user password
    user.password = hashedPassword;

    // 7. Clear OTP fields
    user.resetOtp = null;
    user.otpExpiry = null;

    await user.save();

    // 8. Success response
    return res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      errMsg: "Server Error"
    });
  }
};


export {
    handleSignup,
    handleLogin,
    getProfile,
    handleSendOtp,
    handleVerifyOtp
};