import jwt from "jsonwebtoken";

// Reads the JWT from the httpOnly cookie and attaches the decoded
// payload to req.user. Any route that needs a logged-in user sits
// behind this middleware.
export function verifyToken(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access. Please log in." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    req.user = decoded;
    next();
  });
}