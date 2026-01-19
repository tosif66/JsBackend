import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    // data coming from url
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid videoId found")
    }

    const userId = req.user?._id
    //TODO: toggle like on video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "video not found ")
    }


    const isLiked = await Like.findOne({ likedBy: userId, video: videoId })

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)

        return res.status(200)
            .json(new ApiResponse(200, { liked: false }, "Removed video liked"))
    } else {
        await Like.create({
            likedBy: userId,
            video: videoId
        })
        return res.status(200)
            .json(new ApiResponse(200, { liked: true }, "Video Liked successfully"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(401, "Invalid commentId found")
    }

    //TODO: toggle like on comment
    const userId = req.user?._id

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(401, "Comment not found")
    }

    const isLiked = await Like.findOne({ likedBy: userId, comment: commentId })

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked?._id)

        return res.status(200).json(new ApiResponse(200, { liked: false }, "Comment like removed successfully"))
    } else {
        await Like.create({
            likedBy: userId,
            comment: commentId
        })
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Comment Liked successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(401, "Invalid tweetId found")
    }

    //TODO: toggle like on tweet
    const userId = req.user?._id

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(401, "Tweet not found")
    }

    const isLiked = await Like.findOne({ likedBy: userId, tweet: tweetId })

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked?._id)

        return res.status(200).json(new ApiResponse(200, { liked: false }, "Removed Tweet Liked successfully"))
    } else {
        await Like.create({
            likedBy: userId,
            tweet: tweetId
        })

        return res.status(200).json(new ApiResponse(200, { liked: true }, "Tweet Liked successfully"))
    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id

    const user = User.findById(userId)

    if (!user) {
        throw new ApiError(401, "User not found")
    }

    const likedVideos = await Like.find({ likedBy: userId })

    if (!likedVideos) {
        throw new ApiError(401, "Cannot get liked videos")
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos found successfully"))

})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}                             