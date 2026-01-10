import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubsription
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyJWT);

router
    .route("/c/:channelId")
    .post(toggleSubsription)
    .get(getUserChannelSubscribers)

router.route("/u/:subscriberId").get(getSubscribedChannels)

export default router