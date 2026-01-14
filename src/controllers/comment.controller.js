import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

import { asyncHandler } from "../utils/asyncHandlers.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    if (!videoId) {
        throw new ApiError(400, "video id required")
    }

    const skip = (page - 1) * limit

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username avatar")

    const totalComments = await Comment.countDocuments({video: videoId});

    const totalPages = Math.ceil(totalComments / limit);

    const response = {
        comments,
        currentPage: page,
        totalPages: totalPages,
        totalComments: totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1 
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "video id not fount")
    }
    const comment = await Comment.findByIdAndUpdate(videoId)
    if (!comment) {
        throw new ApiError(400, "Can not add comment")
    }

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id not found")
    }

    const comment = await Comment.findByIdAndUpdate(commentId)

    if (!comment) {
        throw new ApiError(400, "Cannot find comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated"))


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment Id not found")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}