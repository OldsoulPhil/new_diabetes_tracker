import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * Extended Request interface with user data from JWT
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    iat?: number;
    exp?: number;
  };
}

/**
 * JWT Payload interface
 */
interface TokenPayload extends JwtPayload {
  id: number;
  email: string;
}

/**
 * Authentication Middleware
 *
 * Protects routes by verifying JWT tokens.
 * Extracts token from Authorization header (format: "Bearer <token>")
 * Verifies token signature and expiration
 * Attaches user data to req.user for use in protected routes
 *
 * Usage: Add as middleware to any route that requires authentication
 * Example: app.get("/protected-route", authenticateToken, (req, res) => {...})
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
      message: "Please login to access this resource.",
    });
  }

  try {
    // Verify token with JWT_SECRET
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Attach user info to request object for use in route handlers
    req.user = {
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Token expired",
        message: "Your session has expired. Please login again.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        error: "Invalid token",
        message: "Authentication failed. Please login again.",
      });
    }

    return res.status(500).json({
      error: "Authentication error",
      message: "An error occurred during authentication.",
    });
  }
};

/**
 * Optional Authentication Middleware
 *
 * Similar to authenticateToken but doesn't reject requests without tokens.
 * Useful for routes that work differently for authenticated vs anonymous users.
 *
 * If valid token provided: req.user is populated
 * If no/invalid token: req.user is null, request continues
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      req.user = undefined;
      return next();
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    req.user = undefined;
  }

  next();
};
