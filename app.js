const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const path = require('path')
const authRoutes = require('./controllers/authRoutes')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')
const jwt = require('jsonwebtoken')
const upload = require('./controllers/multer')
const mongoose = require('mongoose')
const moment = require('moment')
const { Server } = require('socket.io')
const server = require('http').createServer(app)
const io = new Server(server)
require('dotenv').config()

const uri = process.env.URL
// To connect to mongo
mongoose.connect(uri)

const db = mongoose.connection
db.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})
db.once('open', () => {
  console.log('Connected to MongoDB Atlas')
})

// Models
const User = require('./models/userModel')
const Post = require('./models/postModel')
const Message = require('./models/messageModel')

// View engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
)

// To use flash messages
app.use(flash())

// Authentication (Login and Sigh Up) routes
const JWT_SECRET = process.env.JWT_SECRET
app.use('/', authRoutes)


io.on('connection', (socket) => {
  console.log('A user connected')

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
})

// To check if user is logged in
const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt

  if (token) {
    // Verify the JWT token
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.error(err.message)
        res.redirect('/')
      } else {
        // Token is valid, attach decoded user information to request object
        req.user = decodedToken
        next()
      }
    })
  } else {
    res.redirect('/')
  }
}

// Login and SignUp routes
app.get('/', (req, res) => {
  res.render('index', { error: req.flash('error') })
})

app.get('/signUp', (req, res) => {
  res.render('SignUp', { error: req.flash('error') })
})

// authenticationToken used as middleware to check if user is logged in
app.get('/profile', authenticateToken, async (req, res) => {
  const currUser = await User.findOne({
    username: req.user.username,
  }).populate('posts')
  res.render('profile', { currUser })
})

// Uploading a new post
app.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(404).send('no files were given')
    }
    const currUser = await User.findOne({
      username: req.user.username,
    })
    const newPost = new Post({
      user: currUser._id,
      content: req.body.caption,
      imageUrl: req.file.filename,
    })
    await newPost.save()
    currUser.posts.push(newPost._id)
    await currUser.save()
    res.redirect('/feed')
  }
)

// Feed page
app.get('/feed', authenticateToken, async (req, res) => {
  const Posts = await Post.find().populate('user').sort({ postedDate: -1 })
  const users = await User.find()
  const currUser = await User.findOne({
    username: req.user.username,
  })
  const posts = Posts.map((post) => {
    const elapsedTime = moment(post.postedDate).fromNow()
    return {
      ...post.toObject(),
      elapsedTime,
    }
  })
  res.render('feed', { posts, users, currUser })
})

// Chat page with individual users
app.get('/chat/:userID', authenticateToken, async (req, res) => {
  const currUser = await User.findOne({
    username: req.user.username,
  })
  const secondUser = await User.findOne({
    username: req.params.userID,
  })
  const Messages = await Message.find({
    $or: [
      { senderId: currUser, recieverId: secondUser },
      { senderId: secondUser, recieverId: currUser },
    ],
  })
    .sort({ timestamp: 1 }) // Sort by timestamp in ascending order
    .populate('senderId')
    .populate('recieverId')
  const messages = Messages.map((message) => {
    const elapsedTime = moment(message.timestamp).fromNow()
    return {
      ...message.toObject(),
      elapsedTime,
    }
  })
  res.render('chat', { messages, secondUser, currUser })
})

// Send a new message
app.post('/message/:userID', authenticateToken, async (req, res) => {
  const sender = await User.findOne({
    username: req.user.username,
  })
  const reciever = await User.findOne({
    username: req.params.userID,
  })
  const content = req.body.content
  const newMessage = new Message({
    senderId: sender,
    recieverId: reciever,
    content: content,
  })
  await newMessage.save()
  io.emit('newMessage',{
    sender:sender.username,
    reciever:reciever.username,
    content:content,
    elapsedTime:'few seconds ago'
  })
  res.redirect(`/chat/${req.params.userID}`)
})

// To like a post
app.post('/likes/:postID', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.postID)
  const currUser = await User.findOne({
    username: req.user.username,
  })
  if (!post.likes.includes(currUser._id)) post.likes.push(currUser._id)
  await post.save()
  res.redirect('/feed')
})

// Choosing a new profile picture
app.get('/changeProfile', authenticateToken, (req, res) => {
  res.render('pictureForm',{error:req.flash('error')})
})

// To upload the new profile picture
app.post(
  '/updateProfile',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      req.flash('error','No files chosen')
      return res.redirect('/changeProfile')
    }
    const currUser = await User.findOne({
      username: req.user.username,
    })
    currUser.dp = req.file.filename
    await currUser.save()
    res.redirect('/profile')
  }
)

server.listen(3000)
