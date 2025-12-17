import pool from '../database.js';
import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authMiddleware from "../middleware/auth.js";

const router = Router();
const { sign } = jwt;

router.post('/signup', (req, res, next) => {
    console.log("SIGNUP BODY:", req.body);
    const { user } = req.body;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!user || !user.email || !user.password) {
        const error = new Error("Sähköposti ja salasana ovat pakollisia.");
        error.status = 400;
        return next(error);
    }

    if (user.password.length < 8) {
    const error = new Error("Salasanan tulee olla vähintään 8 merkkiä pitkä.");
    error.status = 400;
    return next(error);
}

    if (!/[A-Z]/.test(user.password)) {
        const error = new Error("Salasanassa tulee olla vähintään yksi iso kirjain.");
        error.status = 400;
        return next(error);
    }

    if (!/\d/.test(user.password)) {
        const error = new Error("Salasanassa tulee olla vähintään yksi numero.");
        error.status = 400;
        return next(error);
    }

    pool.query(
        'SELECT * FROM account WHERE email = $1',
        [user.email],
        (err, result) => {

            if (err) return next(err);

            if (result.rows.length > 0) {
                const error = new Error("Sähköposti on jo käytössä.");
                error.status = 400;
                return next(error);
            }

            hash(user.password, 10, (err, hashedPassword) => {
                if (err) return next(err);

                pool.query(
                    'INSERT INTO account (email, password_hash) VALUES ($1, $2) RETURNING id, email',
                    [user.email, hashedPassword],
                    (err, result) => {
                     if (err) {
                        return next(err);
    }

                        res.status(201).json({
                            message: "Account created",
                            user: result.rows[0]
                        });
                    }
                );
            });
        }
    );
});

router.post('/signin', (req, res, next) => {
    const { user } = req.body;

    if (!user || !user.email || !user.password) {
        const error = new Error('Email and password are required');
        error.status = 400;
        return next(error);
    }

    pool.query(
        'SELECT * FROM account WHERE email = $1',
        [user.email],
        (err, result) => {

            if (err) return next(err);

            if (result.rows.length === 0) {
                const error = new Error('User not found');
                error.status = 404;
                return next(error);
            }

            const dbUser = result.rows[0];

            compare(user.password, dbUser.password_hash, (err, isMatch) => {
                if (err) return next(err);

                if (!isMatch) {
                    const error = new Error('Invalid password');
                    error.status = 401;
                    return next(error);
                }

                const token = sign(
                    { id: dbUser.id, email: dbUser.email },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: "1h" }
                );

                res.status(200).json({
                    message: "Login successful",
                    id: dbUser.id,
                    email: dbUser.email,
                    token
                });
            });
        }
    );
});

router.delete("/delete", authMiddleware, async (req, res, next) => {
    const userId = req.user.id;

    try {
        await pool.query("DELETE FROM group_members WHERE user_id = $1", [userId]);

        await pool.query("DELETE FROM groups WHERE owner_id = $1", [userId]);

        await pool.query("DELETE FROM account WHERE id = $1", [userId]);

        res.json({ message: "Käyttäjätili poistettu onnistuneesti" });

    } catch (err) {
        next(err);
    }
});

export default router;
