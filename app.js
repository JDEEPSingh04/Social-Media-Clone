const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const path = require('path')
const authRoutes = require('./controllers/authRoutes')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')
const jwt = require('jsonwebtoken')
const upload = require('./controllers/multer')
const mongoose = require('mongoose')
const moment = require('moment')
require('dotenv').config()

const uri = process.env.URL

mongoose.connect(uri)

const db = mongoose.connection

db.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

db.once('open', () => {
  console.log('Connected to MongoDB Atlas')
})

const User = require('./models/userModel')
const Post = require('./models/postModel')
const Message = require('./models/messageModel')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(
  session({
    secret: 'SECRET', // Change this to a secure random string
    resave: false,
    saveUninitialized: false,
  })
)

app.use(flash())

const JWT_SECRET = process.env.JWT_SECRET
app.use('/', authRoutes)
// app.use('/', userRoutes)

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt

  if (token) {
    // Verify the JWT token
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.error(err.message)
        res.redirect('/') // Redirect to login page or handle unauthorized access
      } else {
        // Token is valid, attach decoded user information to request object
        req.user = decodedToken
        next() // Proceed to the next middleware or route handler
      }
    })
  } else {
    // No token found, redirect to login page or handle unauthorized access
    res.redirect('/')
  }
}

app.get('/', (req, res) => {
  res.render('index', { error: req.flash('error') })
})

app.get('/signUp', (req, res) => {
  res.render('SignUp', { error: req.flash('error') })
})

app.get('/profile', authenticateToken, async (req, res) => {
  const currUser = await User.findOne({
    username: req.user.username,
  }).populate('posts')
  console.log(currUser.dp)
  res.render('profile', { currUser })
})

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
  const messages=Messages.map((message)=>{
    const elapsedTime = moment(message.timestamp).fromNow()
    return {
      ...message.toObject(),
      elapsedTime,
    }
  })
  res.render('chat', { messages, secondUser, currUser })
})

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
  res.redirect(`/chat/${req.params.userID}`)
})

app.post('/likes/:postID', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.postID)
  const currUser = await User.findOne({
    username: req.user.username,
  })
  if (!post.likes.includes(currUser._id)) post.likes.push(currUser._id)
  await post.save()
  res.redirect('/feed')
})

app.get('/changeProfile', authenticateToken, (req, res) => {
  res.render('pictureForm')
})

app.post(
  '/updateProfile',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(404).send('no files were given')
    }
    console.log('Hii')
    const currUser = await User.findOne({
      username: req.user.username,
    })
    currUser.dp = req.file.filename
    await currUser.save()
    res.redirect('/profile')
  }
)

app.listen(3000)
