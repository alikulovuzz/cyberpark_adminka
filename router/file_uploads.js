const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploads=require('../db/models/uploads')
const dotenv = require('dotenv')
const uuid = require('uuid');
var os = require("os");


dotenv.config()
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || '3000'

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-')+uuid.v1()+ file.originalname)
    }
})

var upload = multer({ storage: storage })
// router.post('/', upload.single('file'), async (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next("hey error")
//     }
//     const fileSave = new uploads({
//         file_link: file.filename
//     })
//     const savedFile = await fileSave.save()
//     res.json(savedFile)
// })

/**
 * @swagger
 * /api/v1/upload:
 *   post:
 *     description: Upload a file and save its link in the database
 *     tags:
 *       - Files
 *     parameters:
 *       - name: file
 *         description: Upload a file
 *         in: formData
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: Successfully uploaded and saved the file
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
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ code: 400, message: 'Please upload a file'});
      }
  
      const fileSave = new uploads({
        file_link: file.filename
      });
  
      const savedFile = await fileSave.save();
      res.status(201).json({ code: 201, data: savedFile, link:`https://my.cyberpark.uz/api/v1/uploads/${savedFile.file_link}` });
    } catch (err) {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500;
      }
      return res.status(err.httpStatusCode).json({ code: err.httpStatusCode, message: err.message, err: err });
    }
  });
  

router.get('/list', async (req, res) => {
    try {
        const files = await uploads.find();
        return res.status(200).json({ code: 200, data: files });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ code: 500, message: 'Internal Server Error', err:err });
    }
})
module.exports = router;