import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import { getCollections } from "../config/db.js";
import { generateToken, setTokenCookie, clearTokenCookie } from "../utils/generateToken.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    image: user.image || null,
    role: user.role,
    isPremium: user.isPremium,
    isBlocked: user.isBlocked,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, image, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (!PASSWORD_RULE.test(password)) {
      return res.status(400).json({
        message: "Password needs at least 6 characters, one uppercase and one lowercase letter.",
      });
    }

    const { users } = getCollections();
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      image: image || "",
      password: hashedPassword,
      role: "user",
      isBlocked: false,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);
    const user = { ...newUser, _id: result.insertedId };

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });
    setTokenCookie(res, token);

    res.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const { users } = getCollections();
    const user = await users.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been blocked. Contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });
    setTokenCookie(res, token);

    res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
}

// Client sends the Google ID token obtained from Google Identity
// Services on the frontend. We verify it server-side, then find or
// create the matching user before issuing our own JWT.
export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { users } = getCollections();
    let user = await users.findOne({ email: payload.email });

    if (!user) {
      const newUser = {
        name: payload.name,
        email: payload.email,
        image: payload.picture || "",
        password: null,
        role: "user",
        isBlocked: false,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await users.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been blocked. Contact support." });
    }

    const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role });
    setTokenCookie(res, token);

    res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  clearTokenCookie(res);
  res.status(200).json({ message: "Logged out successfully." });
}

export async function getMe(req, res, next) {
  try {
    const { users } = getCollections();
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
}