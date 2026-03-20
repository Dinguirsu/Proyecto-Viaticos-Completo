import { Router } from "express";
import { loginMembershipController} from "../controllers/auth.controller.js";

const router = Router();
router.post("/login-membership", loginMembershipController);
export default router;
