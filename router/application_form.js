const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const rateLimit = require('../middleware/request_limitter')
const Application_form = require("../db/models/application_form");
const getCurrentIndianDateTime = require("../helpers/time")


/**
 * @swagger
 * /api/v1/application_form/create:
 *   post:
 *     description: Sing up new Company to Server!
 *     tags:
 *       - V2 Company
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
 *             password:
 *               description: Passwrod of user
 *               example: 94Wqdw56qa#jsd
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
router.post("/create", rateLimit, async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { company,email, requirements, application: app, constituent_documents, description, license, copy_passport, project_description, candidate_application, business_plan } = req.body;
    // Validate user input
    if (!(email && requirements && app && constituent_documents && description && license && copy_passport && project_description && candidate_application && business_plan)) {
      return res.status(400).json({ code: 400, message: 'All input is required' });
    }
    //user validated
    const value = {
      company,
      email,
      requirements,
      application: app,
      constituent_documents,
      description,
      license,
      copy_passport,
      project_description,
      candidate_application,
      business_plan
    };
    const application = new Application_form(value);
    // validation
    var error = application.validateSync();
    if (error) {
      return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
      // return res.status(409).send("Validatioan error");
    }
    const saved_application = await application.save();
    // if (name && url) {
    //   user.img = { name: name, url: url }
    // }
    // return new user
    return res.status(201).json({
      status: 201,
      data: saved_application
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
  // Our register logic ends here
});
/**
 * @swagger
 * /api/v1/application_form/list:
 *   post:
 *     description: Get all company's data!
 *     tags:
 *       - V2 Company
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
router.post("/list", async (req, res) => {
  try {
    let { pageNumber, pageSize } = req.body;
    pageNumber = parseInt(pageNumber);
    pageSize = parseInt(pageSize);
    // this only needed for development, in deployment is not real function
    const count = await Application_form.countDocuments()
    const company = await Application_form.find().sort({ created_at: 1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);    return res.status(202).json({ code: 202, count: count, page: parseInt(count / pageSize) + 1, list_of_companies: company });
  } catch (err) {
    userLogger.error(err);
    console.log(err);
    return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
  }
});
// //( /user/update/:id) in order to update specific user
// router.post("/update/:id",verifyToken, async (req, res) => {
//   const id = req.params.id;
//   //id check
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(422).json({
//       message: 'Id is not valid',
//       error: id,
//     });
//   }
//   const { company_name, email, stir, img_link, phone } = req.body;
//   // const value = authorSchema.validate(req.body);
//   const updateCompany = await Company_form.findById(id);

//   if (!updateCompany) {
//     return res.status(400).json({ code: 404, message: 'User not found' });
//     // return res.status(409).send("User Already Exist. Please Login");
//   }
//   const newValues = {
//     company_name: company_name,
//     email: email,
//     stir: stir,
//     img_link: email.toLowerCase(), // sanitize: convert email to lowercase
//     phone: phone
//   };

//   const validateCompany = new Company_form(newValues);
//   // validation
//   const error = validateCompany.validateSync();
//   if (error) {
//     return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
//   }
//   const user = await Company_form.findOneAndUpdate({ _id: id }, newValues);

//   if (user.err) {
//     return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
//   }
//   else {
//     return res.status(200).json({ code: 200, message: 'user exist and updated', olduser: user })
//   };
// });
// /**
//  * @swagger
//  * /api/v1/company_form/delete:
//  *   delete:
//  *     description: Deletes a company based on the provided ID!
//  *     tags:
//  *       - V2 Company
//  *     parameters:
//  *       - name: id
//  *         description: JSON object containing pageNumber and pageSize
//  *         in: query
//  *         required: true
//  *         type: string
//  *     responses:
//  *       200:
//  *         description: Company deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: string
//  *                   description: A success message
//  *                 data:
//  *                   type: object
//  *                   description: Response data
//  *                 delete_company:
//  *                   type: object
//  *       400:
//  *         description: Bad Request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: An error message
//  *       500:
//  *         description: Internal Server Error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: An error message
//  */
// router.delete("/delete",verifyToken, async (req, res) => {

//   const id = req.query.id;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(422).json({
//       message: 'Id is not valid',
//       error: id,
//     });
//   }

//   // this only needed for development, in deployment is not real function
//   const user = await Company_form.findOneAndDelete({ _id: id });
//   // console.log(user) 
//   if (!user) {
//     return res.status(500).json({ code: 500, message: 'There as not any users yet', error: user })
//   };
//   if (user.err) {
//     return res.status(500).json({ code: 500, message: 'There as not any users yet', error: user })
//   }
//   else {
//     return res.status(200).json({ code: 200, message: 'user exist and deleted', deleted_user: user })
//   };
// });
// /**
//  * @swagger
//  * /api/v1/company_form/getone:
//  *   get:
//  *     description: get organization by id!
//  *     tags:
//  *       - V2 Company
//  *     parameters:
//  *       - name: id
//  *         description: _id
//  *         in: query
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: Company get successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: string
//  *                   description: A success message
//  *                 data:
//  *                   type: object
//  *                   description: Response data
//  *                 delete_user:
//  *                   type: object
//  *       400:
//  *         description: Bad Request
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: An error message
//  *       500:
//  *         description: Internal Server Error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: An error message
//  */
// router.get("/getone",verifyToken, async (req, res) => {

//   try {
//     const id = req.query.id;
//     // id valid chech
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(422).json({
//         message: 'Id is not valid',
//         error: id,
//       });
//     }
//     // this only needed for development, in deployment is not real function
//     const user = await Company_form.find({ _id: id });

//     if (user.err) {
//       return res.status(500).json({ code: 500, message: 'There as not any users yet', error: err })
//     }
//     else {
//       return res.status(200).json({ code: 200, message: 'user exist', user: user })
//     };
//   } catch (err) {
//     return res.status(500).json({ code: 500, message: 'Internal server error', error: err });
//   }
// });
module.exports = router;
