const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { userLogger } = require('../helpers/logger')
const Reports = require("../db/models/reports")
const Company=require("../db/models/company")


/**
 * @swagger
 * /api/v1/reports:
 *   post:
 *     description: Reports of Company!
 *     tags:
 *       - Report
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name_of_report:
 *               description: Name of report
 *               example: Oylik
 *               type: string
 *             file_link:
 *               description: File
 *               example: file.pdf
 *               type: string
 *             company_id:
 *               description: Company Id
 *               example: 64e339fe0c953d151cfb82dc
 *               type: string
 *             year:
 *               description: Year of report
 *               example: 2023
 *               type: string
 *             quarterly:
 *               description: Quarterly report of company
 *               example: first
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
router.post("/", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const { name_of_report, file_link, company_id, year, quarterly} = req.body;
    // Validate user input
    if (!(name_of_report && company_id && year && file_link && quarterly)) {
      return res.status(400).json({ code: 400, message: 'All input is required' });
    }
        // check if user already exist
    // Validate if user exist in our database
    const checkCompany = await Company.findById(company_id);

    if (!checkCompany) {
      return res.status(400).json({ code: 400, message: 'Company is not in DataBase. Incorrect Company' });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    //order validation
    const value = {
      name_of_report: name_of_report,
      file_link: file_link,
      company_id: company_id,
      year: year,
      quarterly: quarterly
    };
    const validateReports = new Reports(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
    }
    const report = await validateReports.save();

    return res.status(201).json(report);
  } catch (err) {
    userLogger.error(err);
    console.log(err)
    return res.status(500).json({ code: 500, message: 'Internal server error', err: err });
  }
  // Our register logic ends here
});

/**
 * @swagger
 * /api/v1/reports/status_change:
 *   post:
 *     description: Status of Company!
 *     tags:
 *       - Report
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             report_id:
 *               description: ReportId of company
 *               example: 64e33a200c953d151cfb82e1
 *               type: string
 *             status:
 *               description: Status
 *               example: progress
 *               type: boolen
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
router.post("/status_change", async (req, res) => {
  const { report_id, status} = req.body;
  //id check
  if (!mongoose.Types.ObjectId.isValid(report_id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: report_id,
    });
  }
  // const value = authorSchema.validate(req.body);
  const reportCheck = await Reports.findById(report_id);

  if (!reportCheck) {
    return res.status(400).json({ code: 404, message: 'Report not found' });
  }
  const newValues = {
    status: status
  };

  const validateReport = new Reports(newValues);
  // validation
  const error = validateReport.validateSync();
  if (error) {
    return res.status(409).json({ code: 409, message: 'Validatioan error', error: error });
    // return res.status(409).send("Validatioan error");
  }
  
  // this only needed for development, in deployment is not real function
  const report = await Reports.findOneAndUpdate({ _id: report_id }, newValues);

  if (report.err) {
    return res.status(500).json({ code: 500, message: 'There as not any reports yet', error: err })
  }
  else {
    report.status=status
    return res.status(200).json({ code: 200, message: 'report exist and updated', oldreport: report })
  };
});

/**
 * @swagger
 * /api/v1/reports/getlist:
 *   post:
 *     description: List of Reports!
 *     tags:
 *       - Report
 *     parameters:
 *       - name: data
 *         description: JSON object containing pageNumber and pageSize
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             quarterly:
 *               description: Quarterly report of company
 *               example: first
 *               type: string
 *             status:
 *               description: Status of report
 *               example: progress
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
router.post("/getlist", async (req, res) => {
  const { quarterly, status} = req.body;
  // console.log(req)
  // userLogger.info(req.header)
  // this only needed for development, in deployment is not real function
  const query = {
    quarterly: quarterly, // Assuming 'quarterly' is a field in your reports
    status: status // Assuming 'status' is a field in your reports
  };
  const reports = await Reports.find(query);
  console.log(reports)
  if (reports.err||reports<=0) {
    return res.status(500).json({ code: 500, message: 'There as not any reports yet', error: reports.err })
  }
  else {
    return res.status(200).json({ code: 200, message: 'reports exist', reports: reports })
  };
});
//( /reports/delete/:id) in reports to delete specific user
router.delete("/delete/:id", async (req, res) => {

  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      message: 'Id is not valid',
      error: id,
    });
  }

  // this only needed for development, in deployment is not real function
  const reports = await Reports.findOneAndDelete({ _id: id });
  // console.log(user) 
  if (!reports) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: reports })
  };
  if (reports.err) {
    return res.status(500).json({ code: 500, message: 'There as not any users yet', error: reports })
  }
  else {
    return res.status(200).json({ code: 200, message: 'user exist and deleted', deleted_user: reports })
  };
});
module.exports = router;
