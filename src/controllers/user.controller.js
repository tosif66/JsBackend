import { asyncHandler } from "../utils/asyncHandlers.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinay.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// this method does- get usedId then find user by id 
// then generate accessToke and refreshToken
// then save it into our database
// thene we will return access and refresh token so we'll access it anywhere
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // putting refresh token into user object
        user.refreshToken = refreshToken
        // when we saving user its asked for password validation and then we do this
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate data - not empty
    // check if user already exists: email, username
    // check for image and avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh tokens from response
    // check for user creation, user is created or not
    // if all ok return response

    // getting user details
    const { email, password, fullName, username } = req.body
    // console.log("email: ",email,"password:", password, "fullName", fullName, "username", username);

    // validating data
    if ([fullName, password, email, username].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required!");
    }


    //  checking for user is already existed in db or not

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    // error in this field is not going correctly

    if (existedUser) {
        throw new ApiError(409, "Email or username already exist",);
    }

    // const existedUserName = await User.findOne({
    //     username
    // })

    // if (existedUserName) {
    //     throw new ApiError(409,"Username already taken try different.")
    // }

    // checking for images are submitted by user or not
    // and its saved on local server or not
    // avatar is mendatory to submit from user
    const avatarLocalPath = req.files?.avatar[0]?.path




    //  checking for cover image
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)




    if (!avatar) {
        throw new ApiError(400, "Avatar image is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })




    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )




    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    // get data from req.body
    // username or email check
    // find the user
    // check password
    // access and refresh token generate
    // send it to cookies

    // getting data from user
    const { email, password } = req.body


    if (!email) {
        console.log("username or email required");
        throw new ApiError(400, " email is required")

    }

    // finding user in db

    const user = await User.findOne({ email })

    if (!user) {
        console.log("user not found");
        throw new ApiError(400, "User does not exist")

    }
    // checking password us valid or not

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        console.log("password is invalid")
        throw new ApiError(401, "password is invalid")
    }

    // generate access and refreshToken
    const { accessToken, refreshToken } = await
        generateAccessAndRefreshTokens(user?._id)


    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    console.log(loggedInUser)

    const options = {
        httpOnly: true,
        secure: false
    }

    // setting cookies 
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User LoggedIn Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    // getting user from middlware jwtverify
    await User.findByIdAndUpdate(req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out."))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request ")
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        console.log(user)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = generateAccessAndRefreshTokens(user.id)


        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        console.log(error)
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.
        status(200)
        .json(200, req.user, "current user fetched successfully")

})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "FullName or Email required to update or change")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                email,
                fullName
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account Details Updated Successfully"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(501, "Something went wrong while uploading avatar on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                // because we're storing string in database
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "avatar updated"))


})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(500, "Something went wrong while uploading coverimage on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Cover Image updated successfully")
        )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params

    if(!username?.trim()) {
        throw new ApiError(400, "username not found")
    }

    const channel = await User.aggregate([
        // matching username 
        {
          $match: {
            username: username?.toLowerCase()
          }  
        },
        // finding subscribers 
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        // finding channels that user subscribed
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        // adding both fields to user model and then count them 
        // then adding another field that user is already subscribed or not
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscriptions.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }    
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400, "channel does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))

})

const getUserHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                // sending id in way of object id because mongodb did not know id it have as string and mongoose change it in object id
                _id: mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                // from video model remember when it goes to db it become lowercase and plural so "Video" become "videos"
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        firstName: 1,
                                        username: 1,
                                        avatar: 1,

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                    // try $project out here
                ]
            }
        }
    ])
    return res
    .status(200)
    .json( new ApiResponse(200, user[0].watchHistory, "User History fetched successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccoundDetails,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserHistory
}