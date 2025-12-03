import express from "express";
import cors from "cors";
import "dotenv/config";
import movieRouter from "./routers/movieRouter.js";
import userRouter from "./routers/userRouter.js";
import authMiddleware from "./middleware/auth.js";
import groupRouter from "./routers/groupRouter.js";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/groups", authMiddleware, groupRouter);

app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;

  res.status(status).json({
    message: err.message || "Tuntematon palvelinvirhe."
  });
});

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is listening port ${port}`);
});