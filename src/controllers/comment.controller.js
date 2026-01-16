import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

import { asyncHandler } from "../utils/asyncHandlers.js";
import { Video } from "../models/video.model.js";

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
        .populate("owner", "username avatar")

    const totalComments = await Comment.countDocuments({ video: videoId });

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
    const { comment } = req.body

    if (!comment) {
        throw new ApiError(400, "Please add a comment or comment not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "video not found")
    }

    const newComment = Comment.create({
        content: comment,
        video: videoId,
        owner: req.user?._id
    })

    return res.status(200)
        .json(new ApiResponse(200, newComment, "Comment added successfully"))


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { comment } = req.body

    if (!commentId) {
        throw new ApiError(400, "Comment id not found")
    }
    if (!comment) {
        throw new ApiError(400, "Comment not found to update")
    }

    const newComment = await Comment.findByIdAndUpdate(
        commentId, 
        {
            $set:{
                comment
            }
        },
        {new: true}
    )

    if (!newComment) {
        throw new ApiError(400, "Something went wrong while updating comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newComment, "Comment updated"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment Id not found")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(400, "Comment not found")
    }

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