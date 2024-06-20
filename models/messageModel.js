const mongoose = require('mongoose')

// Defining the schema for messages
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId, // To save reciever id in message model
    ref: 'User',
  },
  recieverId: {
    type: mongoose.Schema.Types.ObjectId, // To save sender id in message model
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

// Creating a Message model based on the messageSchema
const Message = mongoose.model('Message', messageSchema)

module.exports = Message