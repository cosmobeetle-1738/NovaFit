import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { registerSchema, loginSchema } from "../../shared/schema";

const router = Router();

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }

    const { email, password, name } = parsed.data;

    // Check if user exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await storage.createUser(email, hashedPassword, name);

    // Create session
    const session = await storage.createSession(user.id);

    // Create default goals
    await storage.upsertUserGoals(user.id, {});

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        units: user.units,
      },
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create session
    const session = await storage.createSession(user.id);

    // Get user goals
    const goals = await storage.getUserGoals(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        units: user.units,
      },
      goals: goals || null,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (sessionId) {
      await storage.deleteSession(sessionId);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

// Get current user (verify session)
router.get("/me", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (!sessionId) {
      return res.status(401).json({ error: "No session" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const goals = await storage.getUserGoals(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        units: user.units,
      },
      goals: goals || null,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update profile
router.patch("/profile", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (!sessionId) {
      return res.status(401).json({ error: "No session" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { name, avatar, units } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (units !== undefined) updates.units = units;

    const user = await storage.updateUser(session.userId, updates);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        units: user.units,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Update goals
router.patch("/goals", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (!sessionId) {
      return res.status(401).json({ error: "No session" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const goals = await storage.upsertUserGoals(session.userId, req.body);
    res.json({ goals });
  } catch (error) {
    console.error("Update goals error:", error);
    res.status(500).json({ error: "Failed to update goals" });
  }
});

export default router;
