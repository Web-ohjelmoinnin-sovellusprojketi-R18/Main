import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER ==>", authHeader);
    console.log("JWT SECRET KEY loaded? ==>", process.env.JWT_SECRET_KEY ? "YES" : "NO");

    if (!authHeader) {
        return res.status(401).json({ message: "Token puuttuu" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Token puuttuu" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("DECODED USER ==>", decoded);
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        console.log("JWT VERIFY ERROR ==>", err.message);
        return res.status(403).json({ message: "Virheellinen token" });
    }
}
