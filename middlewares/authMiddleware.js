import jwt from "jsonwebtoken";

const authMiddleware = (role) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers?.authorization;



      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const authHeader = req.headers?.authorization;

        console.log("AUTH HEADER =", authHeader);
        console.log("Invalid auth header");
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // attach user
      req.user = decoded;

      // check role
      if (role && decoded.role !== role) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();

    } catch (err) {
      console.log("JWT ERROR:", err);
      res.status(401).json({ message: "Invalid token" });

    }
  };
};

export default authMiddleware;