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

router.get("/:groupId", authMiddleware, async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const groupData = await pool.query(
      "SELECT * FROM groups WHERE id = $1",
      [groupId]
    );

    if (groupData.rows.length === 0) {
      return res.status(404).json({ message: "Ryhmää ei löytynyt" });
    }

    const isOwner = (groupData.rows[0].owner_id === userId);

    if (isOwner) {
      return res.json({
        ...groupData.rows[0],
        is_owner: true,
        is_member: true
      });
    }

    const memberCheck = await pool.query(
      "SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2",
      [groupId, userId]
    );

    if (memberCheck.rows.length > 0) {
        console.log("GET GROUP DEBUG:", {
  userId,
  groupOwner: groupData.rows[0].owner_id,
  isOwner
});
      return res.json({
        ...groupData.rows[0],
        is_owner: false,
        is_member: true
      });
    }

    return res.status(403).json({
      message: "Et kuulu tähän ryhmään",
      is_owner: false,
      is_member: false
    });

  } catch (err) {
    next(err);
  }
});


router.post("/:groupId/join", authMiddleware, async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const isMember = await pool.query(
      "SELECT * FROM group_members WHERE group_id=$1 AND user_id=$2",
      [groupId, userId]
    );

    if (isMember.rows.length > 0)
      return res.status(400).json({ message: "Olet jo ryhmän jäsen" });

    await pool.query(
      `INSERT INTO join_requests (group_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (group_id,user_id) DO UPDATE SET status='pending'`,
      [groupId, userId]
    );

    res.json({ message: "Liittymispyyntö lähetetty" });
  } catch (err) {
    next(err);
  }
});

router.get("/:groupId/requests", authMiddleware, async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const group = await pool.query(
      "SELECT * FROM groups WHERE id=$1 AND owner_id=$2",
      [groupId, userId]
    );

    if (group.rows.length === 0)
      return res.status(403).json({ message: "Et ole ryhmän omistaja" });

    const result = await pool.query(
      "SELECT * FROM join_requests WHERE group_id=$1 AND status='pending'",
      [groupId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:groupId/requests/:requestId", authMiddleware, async (req, res, next) => {
  const { groupId, requestId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  try {
    const group = await pool.query(
      "SELECT * FROM groups WHERE id=$1 AND owner_id=$2",
      [groupId, userId]
    );

    if (group.rows.length === 0)
      return res.status(403).json({ message: "Et ole ryhmän omistaja" });

    if (action === "accept") {
      const reqData = await pool.query(
        "UPDATE join_requests SET status='accepted' WHERE id=$1 RETURNING user_id",
        [requestId]
      );

      const joinUser = reqData.rows[0].user_id;

      await pool.query(
        "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)",
        [groupId, joinUser]
      );

      return res.json({ message: "Hyväksytty" });
    }

    if (action === "reject") {
      await pool.query(
        "UPDATE join_requests SET status='rejected' WHERE id=$1",
        [requestId]
      );
      return res.json({ message: "Hylätty" });
    }

    res.status(400).json({ message: "Tuntematon toiminto" });
  } catch (err) {
    next(err);
  }
});

export default router;
