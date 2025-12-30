import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinay.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const { username, email, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    // finding user in db
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(400, "user does not exist")
    }
    // checking password us valid or not

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "password is invalid")
    }

    // generate access and refreshToken
    const { accessToken, refreshToken } = await 
    generateAccessAndRefreshTokens(user._id)


    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    
    // setting cookies 
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User LoggedIn Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res) => {
    // getting user from middlware jwtverify
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken : undefined
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
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out."))

})

export {
    registerUser,
    loginUser,
    logoutUser
}