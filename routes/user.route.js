const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { uploadFile } = require('../middleware/uploadfile'); 
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kawtharghorbel@gmail.com',
    pass: 'iifn wjcs lpfs biam'
  },
  tls: {
    rejectUnauthorized: false
  }
});


// Register
router.post('/register', uploadFile.single("avatar"), async (req, res) => {
  try {
    let { email, password, firstname, lastname } = req.body;
    const avatar = req.file ? req.file.filename : null;

    const user = await User.findOne({ email });
    if (user)
      return res.status(404).send({ success: false, message: "User already exists" });

    const newUser = new User({ email, password, firstname, lastname, avatar });
    const createdUser = await newUser.save();

    var mailOption = {
      from: '"verify your email" <esps421@gmail.com>',
      to: newUser.email,
      subject: 'verification your email',
      html: `<h2>${newUser.firstname}! thank you for registering</h2>
             <h4>please verify your email</h4>
             <a href="http://${req.headers.host}/api/users/status/edit?email=${newUser.email}">click here</a>`
    };

    transporter.sendMail(mailOption, function (error) {
      if (error) console.log(error);
    });

    return res.status(201).send({
      success: true,
      message: "Account created successfully",
      user: createdUser
    });
  } catch (err) {
    res.status(404).send({ success: false, message: err.message });
  }
});

// afficher la liste des utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      return res.status(404).send({ success: false, message: "All fields are required" });

    let user = await User.findOne({ email });

    if (!user)
      return res.status(404).send({ success: false, message: "Account doesn't exist" });

    let isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword)
      return res.status(404).send({ success: false, message: "Please verify your credentials" });

    if (!user.isActive)
      return res.status(200).send({
        success: false,
        message: 'Your account is inactive, Please contact your administrator'
      });

    delete user._doc.password;

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).send({ success: true, user, token, refreshToken });

  } catch (err) {
    res.status(404).send({ success: false, message: err.message });
  }
});

// Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { iduser: user._id, role: user.role },
    process.env.SECRET,
    { expiresIn: '60s' }
  );
};

// Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { iduser: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1y' }
  );
};

// Refresh route
router.post('/refreshToken', async (req, res) => {
  const refreshtoken = req.body.refreshToken;

  if (!refreshtoken)
    return res.status(404).send({ success: false, message: 'Token Not Found' });

  jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(406).send({ success: false, message: 'Unauthorized' });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).send({ success: true, token, refreshToken });
  });
});

// enable / disable account
router.get('/status/edit', async (req, res) => {
  try {
    let email = req.query.email;
    let user = await User.findOne({ email });
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).send({ success: true, user });
  } catch (err) {
    res.status(404).send({ success: false, message: err.message });
  }
});

module.exports = router;
