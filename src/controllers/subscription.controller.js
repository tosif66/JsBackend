import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";;
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandlers.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    if (channelId.toString() === userId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const filter = {
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(userId),
    };

    const existing = await Subscription.findOne(filter);

    // UNSUBSCRIBE
    if (existing) {
        await Subscription.deleteOne({ _id: existing._id });

        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        );
    }

    // SUBSCRIBE
    await Subscription.create(filter);

    return res.status(200).json(
        new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
    );
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const loggedInUserId = req.user?._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channelId found")
    }

    if (channelId !== loggedInUserId.toString()) {
        throw new ApiError(403, "You are not allowed to view subscribers of this channel")
    }

    const subscribersList = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username avatar")

    if (subscribersList.length === 0) {
        throw new ApiError(404, "Subscribers not found for this channel")
    }

    return res.status(200).json(new ApiResponse(200, subscribersList, "Subscribers fetched successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const loggedInUserId = req.user?._id

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Invalid channelId found")
    }

    if (subscriberId !== loggedInUserId.toString()) {
        throw new ApiError(403, "You are not allowed to view subscribed channels of this user")
    }

    const channelList = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username avatar")

    if (channelList.length === 0) {
        throw new ApiError(404, "Subscribed channel not found")
    }

    return res.status(200).json(new ApiResponse(200, channelList, "Subscribed Channel list found successfully"))

})

export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}