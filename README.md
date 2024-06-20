# Social Media Platform

This project is a chat application built with Express.js, MongoDB, and Socket.io. Users can register, login, create posts, like posts, chat with other users in real-time, and update their profile pictures.

## Features

- User Authentication (Login and Signup) with secure JWT (JSON Web Token)
- Secure File Upload for Profile Pictures and Posts
- Real-Time Chat with Socket.io for seamless communication
- User Profile with Posts and Likes for a personalized experience

## Technologies Used

- **Backend:** Express.js (web framework), Mongoose (MongoDB object modeling), Socket.io (real-time communication)
- **Database:** MongoDB (NoSQL document database)
- **Templating Engine:** EJS (efficient templating for dynamic content)
- **Other:** body-parser (parses request bodies), cookie-parser (handles cookies), express-session (session management), express-flash (temporary messages), multer (file upload handling), moment.js (date/time formatting)

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the project root directory and add the following environment variables (replace placeholders with your actual values):

```javascript
URL=mongodb://your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
```

## Running the Application

1. Start the server:

```bash
node app.js
```

2. The application will be running on port 3000 by default. You can access it at http://localhost:3000 in your browser.

## API ROUTES

## Authentication

- /: GET - Login page
- /signup: GET - Signup page

## Protected Routes (require authentication):

- /profile: GET - User profile page
- /feed: GET - Feed page with all posts
- /chat/:userID: GET - Chat page with a specific user
- /message/:userID: POST - Send a new message to a user
- /likes/:postID: POST - Like a post
- /changeProfile: GET - Change profile picture page
- /updateProfile: POST - Upload a new profile picture

## Socket.io Events

- connection: When a user connects to the chat
- disconnect: When a user disconnects from the chat
- newMessage: When a new message is sent (broadcasted to all connected users)

## Notes

- This is a basic example and can be extended with additional features like private messages, notifications, user search, etc.
- Remember to replace your-strong_secret_key in the session configuration with a strong and unique secret key for production deployment to ensure security.
