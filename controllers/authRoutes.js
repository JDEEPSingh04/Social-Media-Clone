const User = require('../models/userModel') // User Model
const bcrypt = require('bcrypt') 
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET // Secret for JWT
DefaultProfile = process.env.DEFAULT_PROFILE // URL for default profile pic

// Function to generate JWT token
const generateAccessToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' })
}

// Route for user signup
router.post('/signUp', async (req, res) => {
  const { username, password, email, fullname } = req.body
  try {
    const existingUser = await User.findOne({ username })
    // Check if the username already exists
    if (existingUser) {
      req.flash('error', 'Username already exists') // To send error message to the frontEnd
      return res.redirect('/signUp')
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user instance
    const newUser = new User({
      username,
      password: hashedPassword,
      email: email,
      fullname: fullname,
      dp: DefaultProfile,
    })
    await newUser.save()

    // Generate JWT token for the user
    const token = generateAccessToken({ username: newUser.username })

    // Store token in cookies
    res.cookie('jwt', token, { httpOnly: true })
    res.redirect('/feed')
  } catch (error) {
    console.error(error)
    req.flash('error', 'Error registering user')
    res.redirect('/signUp')
  }
})

// Login route
router.post('/', async (req, res) => {
  const { username, password } = req.body
  try {
    // Check if the username exists
    const user = await User.findOne({ username })
    if (!user) {
      req.flash('error', 'User not found')
      return res.redirect('/')
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      req.flash('error', 'User not found')
      return res.redirect('/')
    }
    const token = generateAccessToken({ username: user.username })
    res.cookie('jwt', token, { httpOnly: true })
    // Login successful
    res.redirect('/feed')
  } catch (error) {
    req.flash('error', 'User not found')
    return res.redirect('/')
  }
})

router.get('/logout', (req, res) => {
  // Clear JWT cookie to logout
  res.clearCookie('jwt')
  res.redirect('/')
})

module.exports = router
