// This is a wraper function which is used to make any function async which we are doing in db
// There are two trick to write wraper functions
// first one is using try and catch to do that
// And second is Promises and  .then .catch

//  Promises method to create wraper function

const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error) => next(error))
    }

}

export {asyncHandler}


// try and catch method

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)        
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// export {asyncHandler}