// middleware/auth.middleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        // 1. Get token from cookie (your custom name)
        const token = req.cookies?.irevsl_gbxra;

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: No token provided",
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach user info to request
        req.user = decoded; // { userId, identifier, etc }
        console.log("IDENTITY OF USER:",req.user);

        // 4. Continue to protected route
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized: Invalid or expired token",
        });
    }
};
