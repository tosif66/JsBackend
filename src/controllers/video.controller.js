import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandlers.js"
import { uploadOnCloudinary } from "../utils/cloudinay.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { query, sortBy, sortType, userId } = req.query

    //TODO: get all videos based on query, sort, pagination

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit

    const filter = {}

    if (query) {
        filter.title = { $regex: query, $options: "i" }
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        filter.owner = userId
    }

    const sortOptions = {}

    if (sortBy) {
        sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
    }

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)

    const response = {
        videos,
        total: video.length,
        page,
        limit,

    }

    return res.status(200)
        .json(new ApiResponse(200, response, "All videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    // TODO: get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required")
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "video local path not found")
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path


    const videoFile = await uploadOnCloudinary(videoLocalPath)

    
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    

    if (!videoFile) {
        throw new ApiError(400, "Something went wrong while uploading video on cloudinary")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Something went wrong while uploading thumbnail on cloudinary")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        title,
        description,
        views: 0,
        owner: req.user?._id,
        isVideoPublished: true
    })


    return res.status(200)
        .json(new ApiResponse(200, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(400, "Video Id not found")
    }
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video found successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body

    if (!title && !description) {
        throw new ApiError(400, "Title and Description are required")
    }


    const thumbnailLocalPath = req.file?.thumbnail[0]?.path

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)


    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail
            }
        }
    )

    if (!video) {
        throw new ApiError(400, "video not found")
    }

    return res.status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(400, "video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, " video not found ")
    }

    const toggled = video.isVideoPublished ? false : true

    return res.status(200)
        .json(new ApiResponse(200, toggled, "video publish toggled successfully "))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}