import mongoose, {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import {Like} from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    // data coming from url
    const { videoId } = req.params
    //TODO: toggle like on video
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "video not found ")
    }

    


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}