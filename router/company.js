const express = require('express');
const router = express.Router();
const config =require('../config/auth.config')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose =require('mongoose');
const {verifyToken,isCompany}=require('../middleware/auth')
const rateLimit = require('../helpers/request_limitter');
const { userLogger, paymentLogger } = require('../helpers/logger');
const Company = require("../db/models/company");
const sendMail = require("../helpers/sendemail")
const RefreshToken=require("../db/models/refreshToken.model")



/**
 * @swagger
 * /api/v1/company/signup:
 *   post:
 *     description: Sing up new Company to Server!
 *     tags:
 *       - Company
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             cn:
 *               description: Director's name of company
 *               type: string
 *               example: XAMZIN ALBERT ALMAZOVICH
 *             o:
 *               description: Full name of company
 *               example: KIBERNETIKADA INNOVATSIYALAR IT-PARKI MCHJ
 *               type: string
 *             pinfl:
 *               description: PINFL of company
 *               example: 32808810170066
 *               type: string
 *             t:
 *               description: Position
 *               example: ДИРЕКТОР
 *               type: string
 *             tin:
 *               description: tin
 *               example: 308121587
 *               type: string
 *             uid:
 *               description: uid
 *               example: 575975561
 *               type: string
 *             alias:
 *               description: alias
 *               example: cn=DS3081215870002 albert almazovich,name=albert,surname=xamzin,o=kibernetikada innovatsiyalar it-parki mchj,l=mirzo ulug'bek tumani,st=toshkent shahri,c=uz,uid=575975561,1.2.860.3.16.1.2=32808810170066,t=директор,1.2.860.3.16.1.1=308121587,businesscategory=masʼuliyati cheklangan jamiyat,serialnumber=77ebb2ed,validfrom=2023.02.16 17:09:57,validto=2025.02.16 23:59:59
 *               type: string
 *             name:
 *               description: DS name
 *               example: DS3081215870002
 *               type: string
 *             serialNumber:
 *               description: serialNumber
 *               example: 77EBB2ED
 *               type: string
 *             validFrom:
 *               description: validFrom
 *               example: Thu Feb 16 2023 17:09:57 GMT+0500 (Узбекистан, стандартное время)
 *               type: string
 *             validTo:
 *               description: validTo
 *               example: Sun Feb 16 2025 23:59:59 GMT+0500 (Узбекистан, стандартное время)
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
    const { cn, o, pinfl, t, tin, uid,alias,name,serialNumber,validFrom,validTo } = req.body;
    // Validate user input
    if (!(tin && pinfl && cn)) {
      return res.status(400).json({ code: 400, message: 'All input is required' });
    }
    // check if user already exist
    // Validate if user exist in our database
    const oldCompany = await Company.findOne({ pinfl });

    if (oldCompany) {
      return res.status(409).json({ code: 400, message: 'Company Already Exist. Please Login' });
      // return res.status(409).send("User Already Exist. Please Login");
    }

    //user validated
    const value = {
      cn: cn,
      organization_name: o,
      pinfl: pinfl,
      position: t,
      tin: tin,
      uid: uid,
      alias:alias,
      name: name,
      serialNumber:serialNumber,
      validFrom: validFrom,
      validTo:validTo
    };
    const company = new Company(value);
    // validation
    var error = company.validateSync();
    if (error) {
      return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
      // return res.status(409).send("Validatioan error");
    }
    const saved_company = await company.save();
    // if (name && url) {
    //   user.img = { name: name, url: url }
    // }
    // return new user
    return res.status(201).json({
      status:201,
      data:saved_company});
  } catch (err) {
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
  // Our register logic ends here
});

/**
 * @swagger
 * /api/v1/company/checkCompany:
 *   post:
 *     description: Sing up new Company to Server!
 *     tags:
 *       - Company
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             pcks7:
 *               description: pcks7
 *               example: DS3081215870002DS3081215870002ERNETIKADAINNOVATSIY
 *               type: string
 *             pinfl:
 *               description: PINFL of company
 *               example: 32808810170066
 *               type: string
 *             tin:
 *               description: tin
 *               example: 308121587
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
router.post("/checkCompany", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { pcks7, pinfl, tin } = req.body;
    // Validate user input
    if (!(pcks7 && tin && pinfl )) {
      return res.status(400).json({ code: 400, message: 'All input is required' });
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldCompany = await Company.findOne({ pinfl });

    if (!oldCompany) {
      return res.status(409).json({ code: 400, message: 'Company is not exist' });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    return res.status(200).json({
      status:200,
      message: 'Company is exist'});
  } catch (err) {
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
  // Our register logic ends here
});
/**
 * @swagger
 * /api/v1/company/signin:
 *   post:
 *     description: Sing in Company to Server!
 *     tags:
 *       - Company
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             cn:
 *               description: Director's name of company
 *               example: XAMZIN ALBERT ALMAZOVICH
 *               type: string
 *             pinfl:
 *               description: PINFL of company
 *               example: 32808810170066
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
router.post("/signin", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { cn, pinfl } = req.body;

    // Validate user input
    if (!(true)) {
      return res.status(400).json({result:"Key is not valid"})
    }
    // Validate user input
    if (!(pinfl && cn)) {
      return res.status(400).json({result:"pinfl or cn missed"})
    }
    // Validate if user exist in our database
    const company = await Company.findOne({ pinfl });
    if (!company) {
      return res.status(409).json({ code: 400, message: 'Company is not exist' });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    const token = jwt.sign({ id: company._id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });
    let refreshToken = await RefreshToken.createToken(company);
    return res.status(200).json({result:"success",data:company,token:token,refreshToken:refreshToken});
  } catch (err) {
    userLogger.error(err);
    console.log(err);
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
  // Our register logic ends here
});

/**
 * @swagger
 * /api/v1/company/refreshToken:
 *   get:
 *     description: refreshToken of Company!
 *     tags:
 *       - Company
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
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
router.get("/refreshToken", async (req, res) => {
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
 * /api/v1/company/list:
 *   post:
 *     description: Get all company's data!
 *     tags:
 *       - Company
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
router.post("/list",verifyToken,isCompany, async (req, res) => {
  let { pageNumber, pageSize } = req.body;
  pageNumber = parseInt(pageNumber);
  pageSize = parseInt(pageSize);
  // this only needed for development, in deployment is not real function
  try {

    const company = await Company.find()
    .skip((pageNumber - 1) * pageSize) 
    .limit(pageSize)           
    .sort({ first_name: 1 });
    // console.log(user)
    return res.status(202).json({ code: 202, list_of_companies: company });

  } catch (err) {
    userLogger.error(err);
    console.log(err);
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
});
//( /user/update/:id) in order to update specific user
router.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  //id check
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: id,
    });
  }
  const { company_name, email, stir, img_link, phone } = req.body;
  // const value = authorSchema.validate(req.body);
  const updateCompany = await Company.findById(id);

    if (!updateCompany) {
      return res.status(400).json({ code: 404, message: 'User not found' });
      // return res.status(409).send("User Already Exist. Please Login");
    }
  const newValues = {
    company_name: company_name,
    email: email,
    stir: stir,
    img_link: email.toLowerCase(), // sanitize: convert email to lowercase
    phone: phone
  };

  const validateCompany = new Company(newValues);
  // validation
  const error = validateCompany.validateSync();
  if (error) {
    return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
  }
  const user = await Company.findOneAndUpdate({ _id: id }, newValues);

  if (user.err) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
  }
  else {
    return res.status(200).json({ code: 200, message: 'user exist and updated', olduser: user })
  };
});
//( /user/resetpassworduser) in order to get list of users
router.post('/resetpassworduser', async (req, res) => {
  const { email } = req.body;
  const user = await Company.findOne({ email: email });
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
  return res.status(200).json({ code: 200, message: 'We sent e resent link your ', user: user,text:text });
});
//( /user/delete/:id) in order to delete specific user
router.delete("/delete/:id", async (req, res) => {

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: id,
    });
  }

  // this only needed for development, in deployment is not real function
  const user = await Company.findOneAndDelete({ _id: id });
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
//( /getone/:id) in order to get specific client
router.get("/getone/:id", async (req, res) => {

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
  const user = await Company.find({ _id: id });

  if (user.err) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
  }
  else {
    return res.status(200).json({ code: 200, message: 'user exist', user: user })
  };
});
module.exports = router;
