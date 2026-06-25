import jwt from "jsonwebtoken";

export const verifyToken = (req,res,next)=>{
    console.log(req.headers);
    
    const authHeader = req.headers["authorization"]
    console.log("authentication header:",authHeader);
    

    if(!authHeader){
        return res.status(401).json({errMsg:"unauthorized user"})
    }

    const token = authHeader.split(' ')[1];

    console.log("the jwtsecreet key is" ,process.env.JWT_SECRET);
    

    console.log("Extracted token:",token);
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            return res.status(404).json({errMsg:"Forbidden user"})
        }

        console.log(req.user);

        console.log("user from token:",user);
        
        req.user = user;
        next()
    })
    

}