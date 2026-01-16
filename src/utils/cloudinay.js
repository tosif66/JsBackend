import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has uploaded successfully on cloudinary
        // console.log("file has been uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the operation got failed
        console.log("error in uploading on cloudinary", error);

        return null

    }
}

const deleteOnCloudinary = async (public_id, resource_type = "image") => {
    if (!public_id) return null

    const result = await cloudinary.uploader.destroy(public_id, {
        resource_type
    })
    return result
}

export { uploadOnCloudinary, deleteOnCloudinary }