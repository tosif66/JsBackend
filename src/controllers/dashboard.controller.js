import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId  = req.user?._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid Channel Id")
    }

    const totalVideos = await Video.countDocuments({ owner: channelId })


    const views = await Video.aggregate([
        {
            $match: { channel: channelId }
        },
        {
            $group: {
                _id: null, views: { $sum: "$views" }
            }
        },

    ])

    const totalViews = views[0]?.totalViews || 0

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })


    const like = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData"
            }
        },
        { $unwind: "$videoData" },
        {
            $match: { "videoData.owner": channelId }
        },
        {
            $group: {
                _id: null,
                totalLikes: {$sum: 1}
            }
        }
    ])

    const totalLikes = like[0]?.totalLikes || 0

    const response = {
        totalLikes,
        totalSubscribers,
        totalVideos,
        totalViews
    }

    return res.status(200).json(new ApiResponse(200, response, "Channel Stats fetched successfully "))


})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid Channel Id")
    }

    const videos = await Video.find({ owner: channelId })
        .select("title thumbnail views duration createdAt")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})


export {
    getChannelStats,
    getChannelVideos
}