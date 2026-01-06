import { protectedRoute } from "../middlewares/authMiddleware.js";
import authRoutes from "./authRoute.js";
import userRoutes from "./userRoute.js";
import friendRoutes from "./friendRoute.js";

export default function route(app) {
  // public routes
  app.use("/api/auth", authRoutes);

  // private routes
  app.use(protectedRoute);
  app.use("/api", userRoutes);
  app.use("/api/friends", friendRoutes);
}
