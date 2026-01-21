import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, visibility } = req.body
    const userId = req.user?._id
    //TODO: create playlist
    if (!name || !description) {
        throw new ApiError(401, "Name and description are required")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(401, "User not found")
    }



    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: userId,
        visibility: visibility || "public"

    })

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const loggedInUserId = req.user._id


    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid userId found")
    }

    const matchStage = {
        owner: new mongoose.Types.ObjectId(userId)
    }

    if (userId !== loggedInUserId.toString()) {
        matchStage.visibility = "public"
    }




    //TODO: get user playlists
    const userPlaylist = await Playlist.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" }

            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.avatar": 1,
                videos: {
                    _id: 1,
                    title: 1,
                    thumbnail: 1,
                    views: 1
                }
            }
        }

    ]
    )

    if (userPlaylist.length === 0) {
        throw new ApiError(400, "User Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, userPlaylist, "User playlist fetched successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid playlist id found")
    }

    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched by id successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params
    // TODO: add videos to playlist



    if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid video and playlist id found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }



    const videoAddedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        { new: true }
    )

    if (!videoAddedPlaylist) {
        throw new ApiError(501, "Something went wrong while adding video to playlist")
    }

    return res.status(200).json(new ApiResponse(200, videoAddedPlaylist, "Video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid video and playlist id found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }


    const videoRemovedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, videoRemovedPlaylist, "Video removed from playlist successfully"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid playlist id found")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }


    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description, visibility } = req.body
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId found")
    }

    if (!name && !description ) {
        throw new ApiError(400, "All fields required enter name and description to update")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
                ...(visibility && {visibility})
            }
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(501, "Something went wrong while updating playlist")
    }




    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successully"))


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}