import { Router } from "express";
import router from "./notifications.routes.js";

const notificationsRouter = Router();

notificationsRouter.use("/", router);

export default notificationsRouter;
