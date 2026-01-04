import { asyncHandler } from "../utils/asyncHandlers.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

// creating this middleware to access the token from user to 
// logout him by matching his token
// and verify its token then logout

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // cookie parser send cookies with request
        // so we can access accessToken from cookies
        // if user is in phone or something else where cookies can't be store
        // we'll get header and then we will get Authorization from header and replace the Bearer with empty space so we get our token
        // important - header will pass throught authorization 
        // and Bearer is alway prefix with the token
            


        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        console.log(token);

        if (!token) {
            console.log("token not found")
            throw new ApiError(401, "Unauthorize request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // _id is coming from user model we sign jwt from it
        // .select - allow us to not select any item
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if (!user) {
            console.log("user not found");

            throw new ApiError(401, "Invalid Access Token")
        }
        // here we've done that added new object to req user
        //  and assigned our user to it
        req.user = user
        // next will be go to other middleware or methods ex logout
        next()
    } catch (error) {
        console.log(error)

        throw new ApiError(401, error?.message || "Invalid access token")
    }

})