YouTube Backend API
A comprehensive Node.js backend application that replicates YouTube's core functionality, including video management, user authentication, subscriptions, playlists, comments, likes, and tweets.

🚀 Features
User Management
User registration and authentication with JWT
Password encryption using bcrypt
Access and refresh token generation
User profile management (avatar, cover image, details)
Watch history tracking
Video Management
Video upload and storage via Cloudinary
Video metadata management (title, description, duration, thumbnail)
Publish/unpublish toggle
Video search and filtering
Pagination support
View count tracking
Social Features
Subscriptions: Subscribe/unsubscribe to channels
Likes: Toggle likes on videos, comments, and tweets
Comments: Add, update, delete, and fetch video comments with pagination
Tweets: Create, update, delete, and fetch user tweets
Playlists: Create, manage, and share playlists with public/private visibility
Dashboard Analytics
Channel statistics (total views, subscribers, videos, likes)
Channel video management
🛠️ Tech Stack
Runtime: Node.js
Framework: Express.js
Database: MongoDB with Mongoose ODM
Authentication: JWT (JSON Web Tokens)
File Upload: Multer + Cloudinary
Security: bcrypt, CORS
Utilities: Cookie Parser, dotenv
📋 Prerequisites
Node.js (v14+)
MongoDB instance (local or Atlas)
Cloudinary account for file storage
npm or yarn package manager
🔧 Installation
Clone the repository
Install dependencies
Configure environment variables
Create a .env file in the root directory:

🚀 Getting Started
Start the development server:

The server will run on http://localhost:8000

📚 API Endpoints
Base URL: /api/v1
Resource	Endpoints
Health Check	GET /healthcheck
Users	POST /users/register, POST /users/login, POST /users/logout, GET /users/current-user, etc.
Videos	GET /videos, POST /videos, GET /videos/:videoId, PATCH /videos/:videoId, DELETE /videos/:videoId
Comments	GET /comments/:videoId, POST /comments/:videoId, PATCH /comments/:commentId, DELETE /comments/:commentId
Likes	POST /likes/toggle/v/:videoId, POST /likes/toggle/c/:commentId, POST /likes/toggle/t/:tweetId, GET /likes/videos
Tweets	POST /tweets, GET /tweets/user/:userId, PATCH /tweets/:tweetId, DELETE /tweets/:tweetId
Subscriptions	POST /subscriptions/c/:channelId, GET /subscriptions/c/:channelId, GET /subscriptions/u/:subscriberId
Playlists	POST /playlist, GET /playlist/:playlistId, PATCH /playlist/:playlistId, DELETE /playlist/:playlistId
Dashboard	GET /dashboard/stats, GET /dashboard/videos
📁 Project Structure
🔐 Security Features
JWT-based authentication
Password hashing with bcrypt
CORS protection
HTTP-only cookies for tokens
Request validation
Role-based access control
📝 Environment Variables
Variable	Description
PORT	Server port (default: 8000)
MONGODB_URI	MongoDB connection string
ACCESS_TOKEN_SECRET	Secret key for access tokens
REFRESH_TOKEN_SECRET	Secret key for refresh tokens
CLOUDINARY_*	Cloudinary API credentials
CORS_ORIGIN	Allowed origin for CORS
🧪 Testing
Health check endpoint:

📚 Dependencies
express: Web framework
mongoose: MongoDB ODM
jsonwebtoken: JWT authentication
bcrypt: Password hashing
cloudinary: Cloud file storage
multer: File upload handling
cors: Cross-origin resource sharing
cookie-parser: Cookie parsing
dotenv: Environment variables
📝 License
ISC

👨‍💻 Author
Tosif Ansari

GitHub: @tosif66
Full Repository: JsBackend
🤝 Contributing
Contributions are welcome! Feel free to open issues and submit pull requests.

📧 Support
For questions or support, please open an issue on the GitHub repository.