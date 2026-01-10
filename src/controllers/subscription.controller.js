import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subription } from "../models/subscription.model.js";
import {ApiError} from "../utils/ApiError.js";;
import {ApiReponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandlers";

const toggleSubsription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subsriberId } = req.params
})

export {
    toggleSubsription,
    getSubscribedChannels,
    getUserChannelSubscribers
}