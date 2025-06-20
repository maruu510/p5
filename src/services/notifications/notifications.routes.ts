// notifications.routes.ts
import { Router } from "../../../deps.ts";
import { sendNotificationHandler } from "./notifications.controller.ts";

const router = new Router();
router.post("/api/notifications/send", sendNotificationHandler);

export default router;
