import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandlers.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { tweet } = req.body
    const userId  = req.user?._id

    if(!userId){
        throw new ApiError(401, "userId not found")
    }



    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(401, "User not found")
    }

    if (!tweet) {
        throw new ApiError(401, "Tweet not found please enter some")
    }

    const newTweet = await Tweet.create({
        owner: userId,
        content: tweet
    })

    return res.status(200).json(new ApiResponse(200, newTweet, "Tweet created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    const userTweets = await Tweet.find({ owner: userId })

    if (!userTweets) {
        throw new ApiError(401, "No Tweet found")
    }

    return res.status(200).json(new ApiResponse(200, userTweets, "User Tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { tweet } = req.body

    if (!tweet) {
        throw new ApiError(401, "Tweet not found please enter something to update")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content: tweet }
        },
        { new: true }

    )

    if (!updatedTweet) {
        throw new ApiError(401, "No tweet found to update")
    }

    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    try {
        await Tweet.findByIdAndDelete(tweetId)
    } catch (error) {
        throw new ApiError(501, "Something went wrong while deleting tweet")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}