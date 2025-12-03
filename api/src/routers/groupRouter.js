import express from "express";
import pool from "../database.js";
import authMiddleware from "../middleware/auth.js"; 

const router = express.Router();

router.post("/", authMiddleware, async (req, res, next) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: "Ryhmän nimi vaaditaan" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING *",
            [name, userId]
        );

        await pool.query(
            "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)",
            [result.rows[0].id, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT * FROM groups ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", authMiddleware, async (req, res, next) => {
    const groupId = req.params.id;
    const userId = req.user.id;

    try {
        const member = await pool.query(
            "SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2",
            [groupId, userId]
        );

        if (member.rows.length === 0) {
            return res.status(403).json({ message: "Ei oikeuksia tähän ryhmään" });
        }

        const result = await pool.query("SELECT * FROM groups WHERE id = $1", [groupId]);

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", authMiddleware, async (req, res, next) => {
    const groupId = req.params.id;
    const userId = req.user.id;

    try {
        const groupRes = await pool.query(
            "SELECT * FROM groups WHERE id = $1",
            [groupId]
        );

        if (groupRes.rows.length === 0) {
            return res.status(404).json({ message: "Ryhmää ei löytynyt" });
        }

        const memberRes = await pool.query(
            "SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2",
            [groupId, userId]
        );

        const isMember = memberRes.rows.length > 0;

        res.json({
            group: groupRes.rows[0],
            isMember,
            secret: isMember ? "🎉 Salainen ryhmäsisältö!" : null
        });

    } catch (err) {
        next(err);
    }
});


router.delete("/:id", authMiddleware, async (req, res, next) => {
    const groupId = req.params.id;
    const userId = req.user.id;

    try {
        const group = await pool.query("SELECT * FROM groups WHERE id = $1", [groupId]);

        if (group.rows.length === 0)
            return res.status(404).json({ message: "Ryhmä ei löydy" });

        if (group.rows[0].owner_id !== userId)
            return res.status(403).json({ message: "Ei oikeuksia poistoon" });

        await pool.query("DELETE FROM groups WHERE id = $1", [groupId]);

        res.json({ message: "Ryhmä poistettu" });
    } catch (err) {
        next(err);
    }
});


export default router;
