import { Router } from "../../deps.ts";
import { getDepartments } from "../controllers/departmentController.ts";

const router = new Router();

router.get("/api/departments", getDepartments);

export default router;
