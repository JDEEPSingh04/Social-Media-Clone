const mongoose = require('mongoose')

// To set up a defualt profile picture for all users
DEFAULT_PROFILE = "userProfile.jpg"

// Defining the schema for User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId, // To save Post id in the user model
      ref: 'Post',
    },
  ],
  dp: {
    type: String,
    default:DEFAULT_PROFILE,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
})

// Creating a User model based on the messageSchema
const User = mongoose.model('User', userSchema)

module.exports = User
