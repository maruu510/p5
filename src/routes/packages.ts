import { Router } from "../../deps.ts";
import {
  registerPackage,
  getPackages,
  getPackage
} from "../controllers/packageController.ts";

const router = new Router();

router
  .get("/api/packages", getPackages)
  .get("/api/packages/:id", getPackage)
  .post("/api/packages", registerPackage);

export default router;
