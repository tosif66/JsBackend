import 'dotenv/config';
import connectDB from "./db/index.js";
import { app } from './app.js';



connectDB()
.then(()=>{

    app.on("error",(error)=>{
        console.log("error before listening",error);
        throw error
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })

}) 
.catch((error)=>{
    console.log("MONGO DB connection Failed !!",error)
})












/*
import express from "express"
const app = express()

( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("error in connecting express with db",error)
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`server is running on ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("Error in connecting db" , error);
        throw error
    }
}) ()

*/