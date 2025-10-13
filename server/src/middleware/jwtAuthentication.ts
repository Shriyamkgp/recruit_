import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger.js";

// FIX: Use an explicit type assertion (as string) to tell TypeScript
// that even if the fallback is used, the variable is definitely a string.
const JWT_SECRET: string = (process.env.JWT_SECRET ||
  "your_super_secret_key_change_me") as string;

// Extend the Request object to include the decoded user payload
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Middleware to verify a JSON Web Token (JWT) on protected routes.
 * Looks for the token in the 'Authorization: Bearer <token>' header.
 * @param req - The Express Request object, extended with optional 'user' property.
 * @param res - The Express Response object.
 * @param next - The next middleware or route handler function.
 */
export function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let token;

  // 1. Check if Authorization header exists and is in "Bearer <token>" format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token (Remove "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using the secret key (JWT_SECRET is now guaranteed 'string')
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: string;
      };

      // 3. Attach the user payload to the request for route handlers
      req.user = { id: decoded.id, role: decoded.role };

      // Continue to the next middleware/route handler
      next();
    } catch (error) {
      // Log verification error details
      logger.error("Token verification failed:", { error });

      // 4. Return 401 Unauthorized if the token is invalid or expired
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired",
      });
    }
  }

  // 5. Return 401 Unauthorized if no token is provided in the headers
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
}

export default protect;
