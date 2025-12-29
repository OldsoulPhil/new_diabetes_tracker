// This file is intentionally left minimal for Vercel frontend deployment.
// Your full backend code is preserved in server-backend.ts

// If deploying backend separately, restore code from server-backend.ts
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { PrismaClient, User } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authenticateToken, AuthRequest } from "./middleware/auth.ts";

dotenv.config();

const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ===== SECURITY MIDDLEWARE =====

// Helmet - Sets secure HTTP headers
app.use(helmet());

// CORS - Restrict to allowed origins only
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  })
);

// Body parser & Cookie parser
app.use(bodyParser.json());
app.use(cookieParser());

// General rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth routes - 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
  message: "Too many login attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ===== HELPER FUNCTIONS =====

/**
 * Generate JWT access token (short-lived)
 */
const generateAccessToken = (
  user: Pick<User, "id" | "email" | "name">
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

/**
 * Generate JWT refresh token (long-lived)
 */
const generateRefreshToken = (user: Pick<User, "id">): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

/**
 * Sanitize user object - NEVER return password!
 */
const sanitizeUser = (user: User): Omit<User, "password" | "refreshToken"> => {
  const { password, refreshToken, ...sanitized } = user;
  return sanitized;
};

// ===== VALIDATION RULES =====

const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ===== AUTHENTICATION ROUTES =====

/**
 * POST /auth/register
 * Register a new user
 * Body: { email, name, password }
 */
app.post(
  "/auth/register",
  authLimiter,
  registerValidation,
  async (req: Request, res: Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { email, name, password } = req.body as {
        email: string;
        name: string;
        password: string;
      };

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "User already exists",
          message: "An account with this email already exists",
        });
      }

      // Hash password with bcrypt (10 salt rounds)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with hashed password
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      // Generate tokens
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      // Store refresh token in database
      await prisma.user.update({
        where: { id: newUser.id },
        data: { refreshToken },
      });

      // Send tokens
      res.status(201).json({
        message: "User registered successfully",
        user: sanitizeUser(newUser),
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Registration failed",
        message: "An error occurred during registration",
      });
    }
  }
);

/**
 * POST /auth/login
 * Login user
 * Body: { email, password }
 */
app.post(
  "/auth/login",
  authLimiter,
  loginValidation,
  async (req: Request, res: Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          glucoseEntries: true,
          foodEntries: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        });
      }

      // Verify password with bcrypt
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Send tokens and user data (without password!)
      res.json({
        message: "Login successful",
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Login failed",
        message: "An error occurred during login",
      });
    }
  }
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken }
 */
app.post("/auth/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      return res.status(401).json({
        error: "Refresh token required",
      });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as JwtPayload & { id: number };

    // Check if refresh token matches database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        error: "Invalid refresh token",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(403).json({
      error: "Invalid or expired refresh token",
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (invalidate refresh token)
 */
app.post(
  "/auth/logout",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      // Remove refresh token from database
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { refreshToken: null },
      });

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  }
);

// ===== PROTECTED USER ROUTES =====

/**
 * GET /users/me
 * Get current user's profile
 * Requires: Authentication
 */
app.get(
  "/users/me",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { glucoseEntries: true, foodEntries: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  }
);

/**
 * PATCH /users/me
 * Update current user's profile
 * Requires: Authentication
 */
app.patch(
  "/users/me",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email } = req.body as { name?: string; email?: string };
      const updateData: { name?: string; email?: string } = {};

      // Only allow updating specific fields
      if (name) updateData.name = name;
      if (email) {
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }
        updateData.email = email;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        include: { glucoseEntries: true, foodEntries: true },
      });

      res.json(sanitizeUser(updatedUser));
    } catch (error: any) {
      console.error("Update user error:", error);
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Email already in use" });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

/**
 * DELETE /users/me
 * Delete current user's account
 * Requires: Authentication
 */
app.delete("/users/me", authenticateToken, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// ===== GLUCOSE ENTRY ROUTES =====

/**
 * GET /glucose-entries
 * Get current user's glucose entries
 * Requires: Authentication
 */
app.get(
  "/glucose-entries",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const entries = await prisma.glucoseEntry.findMany({
        where: { userId: req.user!.id },
        orderBy: { timestamp: "desc" },
      });

      res.json(entries);
    } catch (error) {
      console.error("Error fetching glucose entries:", error);
      res.status(500).json({ error: "Failed to fetch glucose entries" });
    }
  }
);

/**
 * POST /glucose-entries
 * Create glucose entry for current user
 * Requires: Authentication
 */
app.post(
  "/glucose-entries",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { glucose } = req.body as { glucose: number };

      // Enhanced validation
      if (!glucose || isNaN(glucose) || glucose <= 0 || glucose > 1000) {
        return res.status(400).json({
          error: "Invalid glucose value",
          message: "Glucose must be between 1 and 1000 mg/dL",
        });
      }

      const entry = await prisma.glucoseEntry.create({
        data: {
          glucose: parseInt(glucose.toString()),
          userId: req.user!.id,
        },
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating glucose entry:", error);
      res.status(500).json({ error: "Failed to create glucose entry" });
    }
  }
);

/**
 * DELETE /glucose-entries/:id
 * Delete a specific glucose entry (only if it belongs to current user)
 * Requires: Authentication
 */
app.delete(
  "/glucose-entries/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Verify the entry exists and belongs to the current user
      const entry = await prisma.glucoseEntry.findUnique({
        where: { id: parseInt(id) },
      });

      if (!entry) {
        return res.status(404).json({ error: "Glucose entry not found" });
      }

      if (entry.userId !== req.user!.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this entry" });
      }

      // Delete the entry
      await prisma.glucoseEntry.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        message: "Glucose entry deleted successfully",
        id: parseInt(id),
      });
    } catch (error) {
      console.error("Error deleting glucose entry:", error);
      res.status(500).json({ error: "Failed to delete glucose entry" });
    }
  }
);

// ===== FOOD ENTRY ROUTES =====

/**
 * GET /food-entries
 * Get current user's food entries
 * Requires: Authentication
 */
app.get(
  "/food-entries",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const entries = await prisma.foodEntry.findMany({
        where: { userId: req.user!.id },
        orderBy: { timestamp: "desc" },
      });

      res.json(entries);
    } catch (error) {
      console.error("Error fetching food entries:", error);
      res.status(500).json({ error: "Failed to fetch food entries" });
    }
  }
);

/**
 * POST /food-entries
 * Create food entry for current user
 * Requires: Authentication
 */
app.post(
  "/food-entries",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { food, carb, weight, weightUnit, favorite, category } =
        req.body as {
          food: string;
          carb: number;
          weight?: string;
          weightUnit?: string;
          favorite?: boolean;
          category?: string | null;
        };

      // Enhanced validation
      if (!food || !carb) {
        return res.status(400).json({ error: "Food and carb values required" });
      }

      // Sanitize and validate food name
      if (
        typeof food !== "string" ||
        food.trim().length === 0 ||
        food.length > 200
      ) {
        return res.status(400).json({
          error: "Invalid food name",
          message: "Food name must be 1-200 characters",
        });
      }

      // Validate carb value (allow any number, including negative or large values)
      if (typeof carb !== "number" || isNaN(carb)) {
        return res.status(400).json({
          error: "Invalid carb value",
          message: "Carbs must be a number",
        });
      }

      // Validate weight if provided
      if (
        weight &&
        (isNaN(parseFloat(weight)) ||
          parseFloat(weight) < 0 ||
          parseFloat(weight) > 10000)
      ) {
        return res.status(400).json({
          error: "Invalid weight value",
          message: "Weight must be between 0 and 10000",
        });
      }

      // Validate weight unit if provided
      const validUnits = [
        "g",
        "kg",
        "oz",
        "lb",
        "mg",
        "serving",
        "piece",
        "cup",
        "tbsp",
        "tsp",
        "fl oz",
        "ml",
        "L",
      ];
      if (weightUnit && !validUnits.includes(weightUnit)) {
        return res.status(400).json({
          error: "Invalid weight unit",
          message: `Weight unit must be one of: ${validUnits.join(", ")}`,
        });
      }

      // Validate category if provided
      const validCategories = [
        "Fruits",
        "Grains",
        "Dairy",
        "Vegetables",
        "Protein",
        "Sugars",
        "Other",
        "None",
        null,
      ];
      if (category && !validCategories.includes(category)) {
        return res.status(400).json({
          error: "Invalid category",
          message: "Category must be a valid food category",
        });
      }

      const entry = await prisma.foodEntry.create({
        data: {
          food,
          carb,
          weight: weight || null,
          weightUnit: weightUnit || null,
          favorite: favorite || false,
          category: category || null,
          userId: req.user!.id,
        },
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating food entry:", error);
      res.status(500).json({ error: "Failed to create food entry" });
    }
  }
);

/**
 * PATCH /food-entries/:id
 * Update food entry
 * Requires: Authentication & ownership
 */
app.patch(
  "/food-entries/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { food, carb, weight, weightUnit, favorite, category } =
        req.body as {
          food?: string;
          carb?: number;
          weight?: string;
          weightUnit?: string;
          favorite?: boolean;
          category?: string | null;
        };

      // Verify ownership
      const entry = await prisma.foodEntry.findUnique({
        where: { id: parseInt(id) },
      });

      if (!entry) {
        return res.status(404).json({ error: "Food entry not found" });
      }

      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update entry
      const updateData: {
        food?: string;
        carb?: number;
        weight?: string | null;
        weightUnit?: string | null;
        favorite?: boolean;
        category?: string | null;
      } = {};
      if (food !== undefined) updateData.food = food;
      if (carb !== undefined) updateData.carb = carb;
      if (weight !== undefined) updateData.weight = weight || null;
      if (weightUnit !== undefined) updateData.weightUnit = weightUnit || null;
      if (favorite !== undefined) updateData.favorite = favorite;
      if (category !== undefined) updateData.category = category;

      const updatedEntry = await prisma.foodEntry.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating food entry:", error);
      res.status(500).json({ error: "Failed to update food entry" });
    }
  }
);

/**
 * DELETE /food-entries/:id
 * Delete food entry
 * Requires: Authentication & ownership
 */
app.delete(
  "/food-entries/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Verify ownership
      const entry = await prisma.foodEntry.findUnique({
        where: { id: parseInt(id) },
      });

      if (!entry) {
        return res.status(404).json({ error: "Food entry not found" });
      }

      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      await prisma.foodEntry.delete({
        where: { id: parseInt(id) },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting food entry:", error);
      res.status(500).json({ error: "Failed to delete food entry" });
    }
  }
);

// ===== MOOD ENTRIES =====

/**
 * GET /mood-entries
 * Get all mood entries for current user
 * Requires: Authentication
 */
app.get(
  "/mood-entries",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const entries = await prisma.moodEntry.findMany({
        where: { userId: req.user!.id },
        orderBy: { timestamp: "desc" },
      });

      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  }
);

/**
 * POST /mood-entries
 * Create new mood entry
 * Requires: Authentication
 */
app.post(
  "/mood-entries",
  authenticateToken,
  [
    body("mood")
      .isString()
      .trim()
      .isIn([
        "happy",
        "sad",
        "excited",
        "mad",
        "angry",
        "tired",
        "stressed",
        "neutral",
        "anxious",
        "calm",
        "frustrated",
        "content",
        "energetic",
        "overwhelmed",
        "peaceful",
        "motivated",
        "grateful",
        "hopeful",
        "lonely",
        "confident",
        "bored",
        "scared",
        "jealous",
        "embarrassed",
        "surprised",
        "proud",
        "shy",
        "relieved",
        "disappointed",
        "guilty",
        "curious",
        "silly",
        "loved",
        "sick",
        "hungry",
        "thirsty",
        "busy",
        "focused",
        "creative",
        "inspired",
        "nostalgic",
        "relaxed",
        "worried",
        "optimistic",
        "pessimistic",
        "apathetic",
        "ashamed",
        "resentful",
        "hurt",
        "secure",
        "unsafe",
        "other",
      ])
      .withMessage("Invalid mood type"),
    body("hoursWorkedOut")
      .isFloat({ min: 0, max: 24 })
      .withMessage("Hours worked out must be between 0 and 24"),
    body("notes")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Notes must be 500 characters or less"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { mood, hoursWorkedOut, notes } = req.body;

      const entry = await prisma.moodEntry.create({
        data: {
          mood,
          hoursWorkedOut,
          notes: notes || null,
          userId: req.user!.id,
        },
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ error: "Failed to create mood entry" });
    }
  }
);

/**
 * DELETE /mood-entries/:id
 * Delete mood entry
 * Requires: Authentication & ownership
 */
app.delete(
  "/mood-entries/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Verify ownership
      const entry = await prisma.moodEntry.findUnique({
        where: { id: parseInt(id) },
      });

      if (!entry) {
        return res.status(404).json({ error: "Mood entry not found" });
      }

      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      await prisma.moodEntry.delete({
        where: { id: parseInt(id) },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      res.status(500).json({ error: "Failed to delete mood entry" });
    }
  }
);

// ===== COMPARISON / ANONYMIZED DATA =====

/**
 * GET /users/anonymous/list
 * Get list of available anonymous users
 * Returns array with count and anonymized IDs
 * Requires: Authentication
 */
app.get(
  "/users/anonymous/list",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      // Get all users except the current user
      const users = await prisma.user.findMany({
        where: {
          id: {
            not: req.user!.id, // Exclude current user
          },
        },
        select: {
          id: true,
        },
      });

      if (users.length === 0) {
        return res.status(404).json({
          error: "No other users available",
          message: "There are no other users with data to compare.",
        });
      }

      // Return list of anonymous user labels
      const anonymousList = users.map((_, index) => ({
        index: index,
        label: `Anonymous User ${index + 1}`,
      }));

      res.json({
        count: users.length,
        users: anonymousList,
      });
    } catch (error) {
      console.error("Error fetching anonymous user list:", error);
      res.status(500).json({ error: "Failed to fetch anonymous user list" });
    }
  }
);

/**
 * GET /users/anonymous/:index
 * Get a specific anonymous user's data by index
 * Returns anonymized data without any identifying information
 * Requires: Authentication
 */
app.get(
  "/users/anonymous/:index",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const index = parseInt(req.params.index);

      // Enhanced validation - prevent enumeration attacks
      if (isNaN(index) || index < 0 || index > 10000) {
        return res.status(400).json({
          error: "Invalid index",
          message: "Index must be a valid non-negative number",
        });
      }

      // Get all users except the current user
      const users = await prisma.user.findMany({
        where: {
          id: {
            not: req.user!.id, // Exclude current user
          },
        },
        include: {
          glucoseEntries: true,
          foodEntries: true,
        },
      });

      if (users.length === 0) {
        return res.status(404).json({
          error: "No other users available for comparison",
          message: "There are no other users with data to compare.",
        });
      }

      // Check if index is valid
      if (index >= users.length) {
        return res.status(404).json({
          error: "User not found",
          message: `Anonymous User ${index + 1} does not exist.`,
        });
      }

      // Get user at specific index
      const selectedUser = users[index];

      // Return completely anonymized data
      const anonymizedData = {
        anonymousId: `Anonymous User ${index + 1}`,
        index: index,
        glucoseEntries: selectedUser.glucoseEntries.map((entry) => ({
          id: entry.id,
          glucose: entry.glucose,
          timestamp: entry.timestamp,
        })),
        foodEntries: selectedUser.foodEntries.map((entry) => ({
          id: entry.id,
          food: entry.food,
          carb: entry.carb,
          favorite: entry.favorite,
          category: entry.category,
          timestamp: entry.timestamp,
        })),
        stats: {
          totalGlucoseEntries: selectedUser.glucoseEntries.length,
          totalFoodEntries: selectedUser.foodEntries.length,
          averageGlucose:
            selectedUser.glucoseEntries.length > 0
              ? (
                  selectedUser.glucoseEntries.reduce(
                    (sum, e) => sum + e.glucose,
                    0
                  ) / selectedUser.glucoseEntries.length
                ).toFixed(1)
              : 0,
        },
      };

      res.json(anonymizedData);
    } catch (error) {
      console.error("Error fetching anonymous user data:", error);
      res.status(500).json({ error: "Failed to fetch anonymous user data" });
    }
  }
);

// ===== HEALTH CHECK =====
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ===== ERROR HANDLING =====
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

  // Production mode: do not auto-seed test users. Only real signups are accepted.
});
