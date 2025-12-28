import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        // putting original name is not a good practice but for simplicity of this code we'll keep it
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage
})