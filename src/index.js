import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";
import route from "./routes/index.js";

const app = express();
const PORT = 3000;

//middewares
app.use(express.json());
app.use(cookieParser());

dotenv.config();
connectDB();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

//Routes
route(app);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
