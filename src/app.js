import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// app.use used for middlewares and configration implementation

// initializing cors with proper origin who can connect with our backend allowing origin
// cors - cross origin resource sharing
// origin - actuall link of frontend connectors
// credentials - it help us to get cookies and other data from user
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// express.json allowing us to get json data from frontend.
// limit - property allow us to control the json data coming we can give string into it

app.use(express.json({limit:"16kb"}))

// urlencoded - it help our server to get data from urls and url encoded helps to manage the space of other things in url
// extended - help us to do more nesting like objects in objects
// limit - same

app.use(express.urlencoded({extended:true,limit: "16kb"}))

// now we are serving static files
// the files we never want to change or some css maybe
app.use(express.static("public"))

// initializing cookie-parser for getting cookies from user and set it
app.use(cookieParser())

export {app}