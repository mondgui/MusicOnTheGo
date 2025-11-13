// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // The token will be sent in the headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data (id, role) to req
    req.user = decoded;

    next(); // Continue to protected route
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authMiddleware;
