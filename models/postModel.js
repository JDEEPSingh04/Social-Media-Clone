const mongoose = require('mongoose')
const User = require('./userModel')

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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

const Post = mongoose.model('Post', postSchema)

module.exports = Post
