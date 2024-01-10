const express = require('express');
const router = express.Router();
const config = require('../config/auth.config')
// const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { verifyToken, isAdmin } = require('../middleware/auth')
const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
const rateLimit = require('../helpers/request_limitter');
const { userLogger, paymentLogger } = require('../helpers/logger');
// const {logger} = require('../helpers/logger');
// const multer=require('multer')
const User = require("../db/models/user");
// const Token = require("../db/models/token");
const sendMail = require("../helpers/sendemail")
const RefreshToken = require("../db/models/refreshToken.model")


/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     description: Sing up new User to Server!
 *     tags:
 *       - User
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             first_name:
 *               description: First Name
 *               type: string
 *               example: Anvar
 *             last_name:
 *               description: Last Name
 *               type: string
 *               example: Narzullayev
 *             father_name:
 *               description: father name
 *               example: Narzullayevich
 *               type: string
 *             email:
 *               description: Email of user
 *               example: anavar.narwer@gmail.com
 *               type: string
 *             img:
 *               description: Images link
 *               example: http://localhost:8081/api/v1/api-docs/#/User/post_api_v1_user_list
 *               type: string
 *             phone:
 *               description: Phone number of user
 *               example: 9895632663
 *               type: string
 *             password:
 *               description: Passwrod of user
 *               example: 94Wqdw56qa#jsd
 *               type: string
 *             role:
 *               description: Role of user
 *               example: admin
 *               type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.post("/signup", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, father_name, email, img_link: img, phone, password, role } = req.body;
    // Validate user input
    if (!(email && password && first_name && last_name)) {
      return res.status(400).json({ code: 400, message: 'All input is required' });
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(400).json({ code: 400, message: 'User Already Exist. Please Login' });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    // Validate phone if user exist in our database
    const oldPhone = await User.findOne({ phone });

    if (oldPhone) {
      return res.status(400).json({ code: 400, message: 'Phone Number Already Exist. Please put another number' });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    var code = Math.floor(1000 + Math.random() * 9000);
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    //user validated
    const value = {
      first_name: first_name,
      last_name: last_name,
      father_name: father_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      phone: phone,
      img_link: img,
      password: encryptedPassword,
      status: 'nagteive',
      role: role
    };
    const user = new User(value);
    // validation
    var error = user.validateSync();
    if (error) {
      return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
      // return res.status(409).send("Validatioan error");
    }
    const saved_user = await user.save();
    // if (name && url) {
    //   user.img = { name: name, url: url }
    // }
    // return new user
    return res.status(201).json(saved_user);
  } catch (err) {
    return res.status(500).json({ code: 500, message: 'Internal server error', error: error });
  }
  // Our register logic ends here
});

/**
 * @swagger
 * /api/v1/user/signin:
 *   post:
 *     description: Sign in User to Server!
 *     tags:
 *       - User
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties: 
 *             email:
 *               description: Email of user
 *               example: anavar.narwer@gmail.com
 *               type: string
 *             password:
 *               description: Passwrod of user
 *               example: 94Wqdw56qa#jsd
 *               type: string  
 *     responses:
 *       201:
 *         description: Successful log in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.post("/signin", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email: email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: config.jwtExpiration,
      });
      let refreshToken = await RefreshToken.createToken(user);
      let authorities = [];
      for (let i = 0; i < user.role.length; i++) {
        authorities.push("ROLE_" + user.role[i].toUpperCase());
      }
      // save user token
      user.token = token;
      user.refreshToken = refreshToken;
      user.authorities = authorities;

      // user
      return res.status(200).json({ data: user, token: token, refreshToken: refreshToken, authorities: authorities });
    }
    return res.status(400).json({ code: 400, message: 'user does not exist and not verified' });
  } catch (err) {
    userLogger.error(err);
    console.log(err);
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
  // Our register logic ends here
});

/**
 * @swagger
 * /api/v1/user/refreshToken:
 *   post:
 *     description: refreshToken of User!
 *     tags:
 *       - User
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             refreshToken:
 *               description: Token of User
 *               example: "FN20LbaF2EWC6MPMWdemBwwnP4ZmX8"
 *               type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.post("/refreshToken", async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    let newAccessToken = jwt.sign({ id: refreshToken.user._id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
});

/**
 * @swagger
 * /api/v1/user/signout:
 *   get:
 *     description: refreshToken of Company!
 *     tags:
 *       - User
 *     parameters:
 *       - name: refreshToken
 *         description: refreshToken
 *         in: query
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             refreshToken:
 *               description: Token of Company
 *               example: "FN20LbaF2EWC6MPMWdemBwwnP4ZmX8"
 *               type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.get("/signout", async (req, res) => {
  const { refreshToken: requestToken } = req.query;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOneAndDelete({ token: requestToken });
    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }
    return res.status(200).json({
      status: "ok"
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
});

/**
 * @swagger
 * /api/v1/user/list:
 *   post:
 *     description: Get all users's data!
 *     tags:
 *       - User
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             pageNumber:
 *               description: Page number
 *               type: string
 *               example: 1
 *             pageSize:
 *               description: Page size
 *               type: string
 *               example: 10
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.post("/list",verifyToken, async (req, res) => {
  try {
    let { pageNumber, pageSize } = req.body;
    pageNumber = parseInt(pageNumber);
    pageSize = parseInt(pageSize);
    if (!pageNumber || !pageSize) {
      return res.status(400).send("pageNumber or pageSize is to defined");
    }
    const user = await User.find()
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ first_name: 1 });
    // console.log(user)
    return res.status(202).json({ code: 202, list_of_users: user });

  } catch (err) {
    return res.status(400).json({ err: err });
  }
});

/**
 * @swagger
 * /api/v1/user/resetpassworduser:
 *   post:
 *     description: Reset password of User to Log in Server!
 *     tags:
 *       - User
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               description: Email of user
 *               example: anavar.narwer@gmail.com
 *               type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.post('/resetpassworduser',verifyToken, async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ code: 400, message: 'Wrong email or no users' });
    // return res.status(409).send("User Already Exist. Please Login");
  }
  var token = new Token({ _clientId: user._id, token: crypto.randomBytes(16).toString('hex') });
  var error = token.validateSync();
  if (error) {
    return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
    // return res.status(409).send("Validatioan error");
  }
  const teken_save = await token.save();
  const text = 'Hello ' + user.first_name + ',\n\n' + 'Please verify your account again by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user/resetpassword/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n';
  // console.log(text);
  const emaile = sendMail(email, text);
  return res.status(200).json({ code: 200, message: 'We sent e resent link your ', user: user, text: text });
});

/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     description: Sing up new User to Server!
 *     tags:
 *       - User
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             first_name:
 *               description: First Name
 *               type: string
 *               example: Anvar
 *             last_name:
 *               description: Last Name
 *               type: string
 *               example: Narzullayev
 *             father_name:
 *               description: father name
 *               example: Narzullayevich
 *               type: string
 *             email:
 *               description: Email of user
 *               example: anavar.narwer@gmail.com
 *               type: string
 *             img:
 *               description: Images link
 *               example: http://localhost:8081/api/v1/api-docs/#/User/post_api_v1_user_list
 *               type: string
 *             phone:
 *               description: Phone number of user
 *               example: 9895632663
 *               type: string
 *             password:
 *               description: Passwrod of user
 *               example: 94Wqdw56qa#jsd
 *               type: string
 *             role:
 *               description: Role of user
 *               example: admin
 *               type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.post('/resetpassword/confirmationp/:email/:token',verifyToken, async (req, res) => {
  const token = req.params.token;
  // const password = req.params.password;
  const password = req.body.password;
  // Validate user input
  if (!token) {
    return res.status(400).json({ code: 400, message: 'Input is required' });
  }

  // check if user already exist
  // Validate if user exist in our database
  const tokenUser = await Token.findOne({ token: token });

  if (!tokenUser) {
    return res.status(400).json({ code: 400, message: 'Your verification link may have expired. Please click on resend for verify your Email.' });
    // return res.status(409).send("User Already Exist. Please Login");
  }
  console.log(password)
  encryptedPassword = await bcrypt.hash(password, 10);
  // Validate if user exist in our database
  const user = await USer.findOneAndUpdate({ _id: tokenUser._clientId, email: req.params.email }, { password: encryptedPassword });

  if (!user) {
    return res.status(400).json({ code: 400, message: 'We were unable to find a client for this Reset. !' });
    // return res.status(409).send("User Already Exist. Please Login");
  }

  // encryptedPassword = await bcrypt.hash(password, 10);

  // const client = await Client.findOne({ _id: tokenClient._clientId, email: req.params.email });

  // client.status = 'true';
  // const clientSave = await client.save();
  // if (clientSave.err) {
  //   return res.status(500).send({ msg: clientSave.err });
  // }
  return res.status(200).json({ code: 200, message: 'confirmation success', client: client });
});
//( /user/confirmation/:email/:token) in order to get list of users
router.get('/confirmation/:email/:token',verifyToken, async (req, res) => {
  const token = req.params.token;
  // const { email } = req.params.email;
  // Validate user input
  if (!token) {
    return res.status(400).json({ code: 400, message: 'Input is required' });
  }

  // check if user already exist
  // Validate if user exist in our database
  const tokenUser = await Token.findOne({ token: token });

  if (!tokenUser) {
    return res.status(400).json({ code: 400, message: 'Your verification link may have expired. Please click on resend for verify your Email.' });
    // return res.status(409).send("User Already Exist. Please Login");
  }
  // Validate if user exist in our database
  const user = await User.findOne({ _id: tokenUser._clientId, email: req.params.email });

  if (!user) {
    return res.status(400).json({ code: 400, message: 'We were unable to find a user for this verification. Please SignUp!' });
    // return res.status(409).send("User Already Exist. Please Login");
  }
  if (user.status == 'true') {
    return res.status(200).send('user has been already verified. Please Login');
  }
  user.status = 'true';
  const userSave = await user.save();
  if (userSave.err) {
    return res.status(500).send({ msg: userSave.err });
  }
  return res.status(200).json({ code: 200, message: 'confirmation success', user: user });
});
//( /user/resendlink) in order to get list of users
router.post('/resendlink',verifyToken, async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ code: 400, message: 'Your verification link may have expired. Please click on resend for verify your Email.' });
    // return res.status(409).send("User Already Exist. Please Login");
  }
  if (user.status == 'true') {
    return res.status(200).send('This account has been already verified. Please log in.');

  }
  var token = new Token({ _clientId: user._id, token: crypto.randomBytes(16).toString('hex') });
  var error = token.validateSync();
  if (error) {
    return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
    // return res.status(409).send("Validatioan error");
  }
  const teken_save = await token.save();
  const text = 'Hello ' + user.first_name + ',\n\n' + 'Please verify your account again by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n';
  // console.log(text);
  const emaile = sendMail(email, text);
  return res.status(200).json({ code: 200, message: 'resend success', user: user });
});
//( /user/update/:id) in order to update specific user
router.post("/update/:id",verifyToken, async (req, res) => {

  const id = req.params.id;
  //id check
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: id,
    });
  }
  const { first_name, last_name, father_name, email, img_id, name, url, phone, password, role } = req.body;
  // const value = authorSchema.validate(req.body);
  const oldUser = await User.findById(id);

  if (!oldUser) {
    return res.status(400).json({ code: 404, message: 'User not found' });
    // return res.status(409).send("User Already Exist. Please Login");
  }
  const newValues = {
    first_name: first_name,
    last_name: last_name,
    father_name: father_name,
    email: email.toLowerCase(), // sanitize: convert email to lowercase
    phone: phone,
    img_id: img_id,
    role: role
  };

  const baseuser = new User(newValues);
  // validation
  const error = baseuser.validateSync();
  if (error) {
    return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
    // return res.status(409).send("Validatioan error");
  }
  // img update logic starts here 

  // img update logic ends here 

  // if (value.error) {
  //   return res.status(422).json({
  //     message: 'Validation error.',
  //     error: value.error,
  //   });
  // }
  // const user = await user.findOne({ _id: id }, (err, user) => {
  //   user.img.name(name);
  // });
  // const img = await user.find({ _id: id });

  // console.log(img.img[0]);
  // if (img.img[0].name != name) {
  //   newValues.img = { name: name, url: url }
  // }

  // this only needed for development, in deployment is not real function
  const user = await User.findOneAndUpdate({ _id: id }, newValues);

  if (user.err) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
  }
  else {
    return res.status(200).json({ code: 200, message: 'user exist and updated', olduser: user })
  };
});

/**
 * @swagger
 * /api/v1/user/delete:
 *   delete:
 *     description: Delete a user based on the provided ID!
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         description: JSON object containing pageNumber and pageSize
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *                 delete_user:
 *                   type: object
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.delete("/delete",verifyToken, async (req, res) => {

  const id = req.query.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: id,
    });
  }

  // this only needed for development, in deployment is not real function
  const user = await User.findOneAndDelete({ _id: id });
  // console.log(user) 
  if (!user) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: user })
  };
  if (user.err) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: user })
  }
  else {
    return res.status(200).json({ code: 200, message: 'user exist and deleted', deleted_user: user })
  };
});

/**
 * @swagger
 * /api/v1/user/getone:
 *   get:
 *     description: Delete a user based on the provided ID!
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         description: JSON object containing pageNumber and pageSize
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User get successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *                 delete_user:
 *                   type: object
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.get("/getone",verifyToken, async (req, res) => {

  try {
    const id = req.query.id;;
    // id valid chech
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({
        message: 'Id is not valid',
        error: id,
      });
    }
    // console.log(req)
    // userLogger.info(req.header)
    // this only needed for development, in deployment is not real function
    const user = await User.find({ _id: id });
    console.log(user)
    if (user.err) {
      return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
    }
    else {
      return res.status(200).json({ code: 200, message: 'user exist', user: user })
    };
  }
  catch {
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
});
/**
 * @swagger
 * /api/v1/user/me:
 *   get:
 *     description: Delete a user based on the provided ID!
 *     tags:
 *       - User
 *     parameters:
 *       - name: x-access-token
 *         description: Token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User get successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: A success message
 *                 data:
 *                   type: object
 *                   description: Response data
 *                 delete_user:
 *                   type: object
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message
 */
router.get("/me", verifyToken,verifyToken, async (req, res) => {

  try {
    const id = req.userId;
    // id valid chech
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({
        message: 'Id is not valid',
        error: id,
      });
    }
    // console.log(req)
    // userLogger.info(req.header)
    // this only needed for development, in deployment is not real function
    const user = await User.find({ _id: id });
    console.log(user)
    if (user.err) {
      return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
    }
    else {
      return res.status(200).json({ code: 200, message: 'user exist', user: user })
    };
  }
  catch {
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }

});
//( /auth/:id) in order to get specific user
router.patch("/auth/:id",verifyToken, async (req, res) => {

  const id = req.params.id;
  // id valid chech
  if (!checkForHexRegExp.test(id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: id,
    });
  }
  // console.log(req)
  // userLogger.info(req.header)
  // this only needed for development, in deployment is not real function
  const user = await User.findOneAndUpdate({ _id: id }, { status: "verified" });

  if (user.err) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
  }
  else {
    return res.status(200).json({ code: 200, message: 'user exist', user: user })
  };
});
//( /user/update/:id) in order to update specific user
router.post("/changepassword/:id",verifyToken, async (req, res) => {

  const id = req.params.id;
  //id check
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: id,
    });
  }
  const { password, newPassword } = req.body;
  // const value = authorSchema.validate(req.body);
  const user = await User.findById(id);
  if (user && (await bcrypt.compare(password, user.password))) {
    //generate new password
    encryptedPassword = await bcrypt.hash(newPassword, 10);
    // user
    const user = await User.findOneAndUpdate({ _id: id }, { password: encryptedPassword });

    return res.status(200).json({ status: 200, message: "success" });
  }
  return res.status(400).json({ code: 400, message: 'user password is not matched' });
});
module.exports = router;
