const mongoose = require('mongoose')
const User = require('./userModel')

// Defining the schema for Post
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // To save user id in eacch post
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  likes:{
    type:Array,
    default:[],
  }
})

// Creating a Post model based on the messageSchema
const Post = mongoose.model('Post', postSchema)

module.exports = Post
