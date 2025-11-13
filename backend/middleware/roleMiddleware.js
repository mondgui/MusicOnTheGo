// backend/middleware/roleMiddleware.js

// This middleware checks if the logged-in user has the required role
const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
      // req.user is already set by authMiddleware
      if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied." });
      }
      next();
    };
  };
  
  export default roleMiddleware;
  