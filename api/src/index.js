import express from "express";
import cors from "cors";
import "dotenv/config";
import movieRouter from "./routers/movieRouter.js";
import favoritesRouter from "./routers/favoritesRouter.js";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/movies", movieRouter);
app.use("/api/favorites", favoritesRouter);

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is listening port ${port}`);
});