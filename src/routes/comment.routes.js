import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT) //Apply verifyJWT to all routes in this file

// route for getting comment and adding comment
router.route("/:videoId").get(getVideoComments).post(addComment)

// route for deleting and updating comment
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router