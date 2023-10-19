const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const { userLogger } = require("../helpers/logger");
const Audit = require("../db/models/audit");
const ReleaseRepublic = require("../db/models/release_republic");
const ReleaseProduct = require("../db/models/release_product");
const Invesment = require("../db/models/invesment");
const ResidentalPayroll = require("../db/models/residental_payroll");
const ImportFunds = require("../db/models/import_funds");
const Company = require("../db/models/company");
const Company_form = require("../db/models/company_form");
const import_funds = require("../db/models/import_funds");
const { error } = require("winston");

/**
 * @swagger
 * /api/v1/audit:
 *   post:
 *     description: Reports of Company!
 *     tags:
 *       - Audit
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
    const {
      name_of_report,
      file_link,
      company_id,
      year,
      quarterly,
      release_product,
      release_republic,
      invesment,
      residental_payroll,
      import_funds,
    } = req.body;
    // Validate user input
    if (!(name_of_report && company_id && year && quarterly)) {
      return res
        .status(400)
        .json({ code: 400, message: "All input is required" });
    }
    // check if user already exist
    // Validate if user exist in our database
    const checkCompany = await Company.findById(company_id);

    if (!checkCompany) {
      return res
        .status(400)
        .json({
          code: 400,
          message: "Company is not in DataBase. Incorrect Company",
        });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    //order validation
    const value = {
      name_of_report: name_of_report,
      file_link: file_link,
      company_id: company_id,
      year: year,
      quarterly: quarterly,
      release_product: release_product,
      release_republic: release_republic,
      invesment: invesment,
      residental_payroll: residental_payroll,
      import_funds: import_funds,
    };
    const validateReports = new Audit(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const report = await validateReports.save();

    return res.status(201).json(report);
  } catch (err) {
    userLogger.error(err);
    console.log(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});
/**
 * @swagger
 * /api/v1/audit/v2:
 *   post:
 *     description: Reports of Company!
 *     tags:
 *       - Audit
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
router.post("/v2", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const {
      name_of_report,
      file_link,
      company_id,
      year,
      quarterly,
      release_product,
      release_republic,
      invesment,
      residental_payroll,
      type_of_report,
      import_funds,
    } = req.body;
    // Validate user input
    if (!(name_of_report && company_id && year && quarterly)) {
      return res
        .status(400)
        .json({ code: 400, message: "Required inputs name_of_report company_id year quarterly" });
    }
    // check if user already exist
    // Validate if user exist in our database
    const checkCompany = await Company_form.findById(company_id);
    if (!checkCompany) {
      return res
        .status(400)
        .json({
          code: 400,
          message: "Company is not in DataBase. Incorrect Company",
        });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    //order validation
    const value = {
      name_of_report: name_of_report,
      file_link: file_link,
      company_id: company_id,
      year: year,
      quarterly: quarterly,
      release_product: release_product,
      release_republic: release_republic,
      invesment: invesment,
      residental_payroll: residental_payroll,
      type_of_report: type_of_report,
      import_funds: import_funds,
    };
    const validateReports = await Audit(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const report = await validateReports.save();

    return res
      .status(201)
      .json({ code: 200, message: "Success", report: report });
  } catch (err) {
    userLogger.error(err);
    console.log(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});
/**
 * @swagger
 * /api/v1/audit/v2_update:
 *   post:
 *     description: Reports of Company!
 *     tags:
 *       - Audit
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
router.post("/v2_update", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const {
      _id,
      name_of_report,
      file_link,
      company_id,
      year,
      quarterly,
      release_product,
      release_republic,
      invesment,
      residental_payroll,
      type_of_report,
      import_funds,
    } = req.body;
    // Validate user input
    if (!(name_of_report && company_id && year && quarterly)) {
      return res
        .status(400)
        .json({ code: 400, message: "All input is required" });
    }
    // check if user already exist
    // Validate if user exist in our database
    const checkCompany = await Company_form.findById(company_id);

    if (!checkCompany) {
      return res
        .status(400)
        .json({
          code: 400,
          message: "Company is not in DataBase. Incorrect Company",
        });
      // return res.status(409).send("User Already Exist. Please Login");
    }
    //order validation
    const value = {
      name_of_report,
      file_link,
      company_id,
      year,
      quarterly,
      release_product,
      release_republic,
      invesment,
      type_of_report,
      residental_payroll,
      import_funds,
    };
    const validateReports = new Audit(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const oldReports = await Audit.find({ _id: _id });

    const updateReports = await Audit.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          name_of_report: name_of_report
            ? name_of_report
            : oldReports[0].name_of_report,
          file_link: file_link ? file_link : oldReports[0].file_link,
          company_id: company_id ? company_id : oldReports[0].company_id,
          year: year ? year : oldReports[0].year,
          quarterly: quarterly ? quarterly : oldReports[0].quarterly,
          release_product: release_product
            ? release_product
            : oldReports[0].release_product,
          release_republic: release_republic
            ? release_republic
            : oldReports[0].release_republic,
          invesment: invesment ? invesment : oldReports[0].invesment,
          type_of_report: type_of_report ? type_of_report : oldReports[0].type_of_report,
          residental_payroll: residental_payroll
            ? residental_payroll
            : oldReports[0].residental_payroll,
          import_funds: import_funds
            ? import_funds
            : oldReports[0].import_funds,
        },
      }
    );

    return res.status(201).json(updateReports);
  } catch (err) {
    userLogger.error(err);
    console.log(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});
/**
 * @swagger
 * /api/v1/audit/status_change:
 *   post:
 *     description: Status of Company!
 *     tags:
 *       - Audit
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
  const { report_id, status } = req.body;
  //id check
  if (!mongoose.Types.ObjectId.isValid(report_id)) {
    return res.status(422).json({
      message: "Id is not valid",
      error: report_id,
    });
  }
  // const value = authorSchema.validate(req.body);
  const reportCheck = await Audit.findById(report_id);

  if (!reportCheck) {
    return res.status(400).json({ code: 404, message: "Report not found" });
  }
  const newValues = {
    status: status,
  };

  const validateReport = new Audit(newValues);
  // validation
  const error = validateReport.validateSync();
  if (error) {
    return res
      .status(409)
      .json({ code: 409, message: "Validatioan error", error: error });
    // return res.status(409).send("Validatioan error");
  }

  // this only needed for development, in deployment is not real function
  const report = await Audit.findOneAndUpdate({ _id: report_id }, newValues);

  if (report.err) {
    return res
      .status(500)
      .json({ code: 500, message: "There as not any reports yet", error: err });
  } else {
    report.status = status;
    return res
      .status(200)
      .json({
        code: 200,
        message: "report exist and updated",
        oldreport: report,
      });
  }
});
/**
 * @swagger
 * /api/v1/audit/getlist:
 *   post:
 *     description: List of Reports!
 *     tags:
 *       - Audit
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
  const { quarterly, status } = req.body;
  // console.log(req)
  // userLogger.info(req.header)
  // this only needed for development, in deployment is not real function
  let query = {
    quarterly, // Assuming 'quarterly' is a field in your reports
    status, // Assuming 'status' is a field in your reports
  };
  if (!quarterly && status) {
    query = { status };
  } else if (quarterly && !status) {
    query = { quarterly };
  } else if (!quarterly && !status) {
    const reports = await Audit.find()
      .populate("company_id", "organization_name _id")
      .exec();
    return res
      .status(200)
      .json({ code: 200, message: "reports exist", reports: reports });
  }
  const reports = await Audit.find(query)
    .populate("company_id", "organization_name _id")
    .exec();
  if (reports.err || reports <= 0) {
    return res
      .status(500)
      .json({
        code: 500,
        message: "There as not any reports yet",
        error: reports.err,
      });
  } else {
    return res
      .status(200)
      .json({ code: 200, message: "reports exist", reports: reports });
  }
});
/**
 * @swagger
 * /api/v1/audit/getByCompany:
 *   get:
 *     description: List of Reports!
 *     tags:
 *       - Audit
 *     parameters:
 *       - name: id
 *         description: ID of company who wants to get this
 *         in: query
 *         required: true
 *         example: 652d21468cf46aaaae2a6ee1
 *         type: string
 *       - name: type
 *         description: JSON object containing pageNumber and pageSize
 *         in: query
 *         example: audit
 *         required: true
 *         type: string
 *       - name: pageNumber
 *         description: JSON object containing pageNumber and pageSize
 *         in: query
 *         required: true
 *         example: 1
 *         type: number
 *       - name: pageSize
 *         description: JSON object containing pageNumber and pageSize
 *         in: query
 *         example: 10
 *         required: true
 *         type: number
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
router.get("/getByCompany", async (req, res) => {
  try {
    var { id, type, pageNumber, pageSize } = req.query;
    pageNumber = parseInt(pageNumber);
    pageSize = parseInt(pageSize);
    // this only needed for development, in deployment is not real function
    let query = {
      company_id: id, // Assuming 'quarterly' is a field in your reports
      type_of_report: type, // Assuming 'status' is a field in your reports
    };
    const reports = await Audit.find(query)
      .populate("release_product release_republic residental_payroll invesment import_funds",)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();
    if (reports.err || reports <= 0) {
      return res
        .status(404)
        .json({
          code: 404,
          message: "There as not any reports yet"
        });
    } else {
      return res
        .status(200)
        .json({ code: 200, message: "reports exist", reports: reports });
    }
  } catch (err) {
    return res.status(500).json({ code: 500, message: "Internal server error",err:err })
  }
});
/**
 * @swagger
 * /api/v1/audit/delete:
 *   delete:
 *     description: Delete a report based on the provided ID!
 *     tags:
 *       - Audit
 *     parameters:
 *       - name: id
 *         description: JSON object containing pageNumber and pageSize
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
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
 *                 delete_report:
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
router.delete("/delete", async (req, res) => {
  const id = req.query.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      message: "Id is not valid",
      error: id,
    });
  }

  // this only needed for development, in deployment is not real function
  const reports = await Audit.findOneAndDelete({ _id: id });
  // console.log(user)
  if (!reports) {
    return res
      .status(500)
      .json({
        code: 500,
        message: "There as not any users yet",
        error: reports,
      });
  }
  if (reports.err) {
    return res
      .status(500)
      .json({
        code: 500,
        message: "There as not any users yet",
        error: reports,
      });
  } else {
    return res
      .status(200)
      .json({
        code: 200,
        message: "user exist and deleted",
        deleted_user: reports,
      });
  }
});
////////////////////////
/**
 * @swagger
 * /api/v1/audit/v2:
 *   post:
 *     description: Reports of Company!
 *     tags:
 *       - Audit
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
router.post("/release_product", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const { 
      kind_of_activity,
      OKED,
      year,
      quarter,
      month_1,
      month_2,
      month_3
    } = req.body;
    // // check if user already exist
    // // Validate if user exist in our database
    // const checkCompany = await Company_form.findById(company_id);
    // if (!checkCompany) {
    //   return res
    //     .status(400)
    //     .json({
    //       code: 400,
    //       message: "Company is not in DataBase. Incorrect Company",
    //     });
    //   // return res.status(409).send("User Already Exist. Please Login");
    // }
    //order validation
    const value = {
      kind_of_activity: kind_of_activity,
      OKED: OKED,
      year: year,
      quarter: quarter,
      month_1: month_1,
      month_2: month_2,
      month_3: month_3
    };
    const validateReports = await ReleaseRepublic(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const report = await validateReports.save();

    return res
      .status(201)
      .json({ code: 200, message: "Success", report: report });
  } catch (err) {
    userLogger.error(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});
router.post("/release_republic", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const {
      kind_of_activity,
      OKED,
      country,
      currency,
      year,
      quarter,
      month_1,
      month_2,
      month_3
    } = req.body;
    // // check if user already exist
    // // Validate if user exist in our database
    // const checkCompany = await Company_form.findById(company_id);
    // if (!checkCompany) {
    //   return res
    //     .status(400)
    //     .json({
    //       code: 400,
    //       message: "Company is not in DataBase. Incorrect Company",
    //     });
    //   // return res.status(409).send("User Already Exist. Please Login");
    // }
    //order validation
    const value = {
      kind_of_activity,
      OKED,
      country,
      currency,
      year,
      quarter,
      month_1,
      month_2,
      month_3
    };
    const validateReports = await ReleaseProduct(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const report = await validateReports.save();

    return res
      .status(201)
      .json({ code: 200, message: "Success", report: report });
  } catch (err) {
    userLogger.error(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});
router.post("/residental_payroll", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const {
      employees,
      part_time,
      countforeign,
      performing,
      fund
    } = req.body;
    // // check if user already exist
    // // Validate if user exist in our database
    // const checkCompany = await Company_form.findById(company_id);
    // if (!checkCompany) {
    //   return res
    //     .status(400)
    //     .json({
    //       code: 400,
    //       message: "Company is not in DataBase. Incorrect Company",
    //     });
    //   // return res.status(409).send("User Already Exist. Please Login");
    // }
    //order validation
    const value = {
      employees,
      part_time,
      countforeign,
      performing,
      fund
    };
    console.log(value)
    const validateReports = await ResidentalPayroll(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const report = await validateReports.save();

    return res
      .status(201)
      .json({ code: 200, message: "Success", report: report });
  } catch (err) {
    userLogger.error(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});
router.post("/import_funds", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const {
      name,
      unit,
      qty,
      acc_description,
      residual_value
    } = req.body;
    // // check if user already exist
    // // Validate if user exist in our database
    // const checkCompany = await Company_form.findById(company_id);
    // if (!checkCompany) {
    //   return res
    //     .status(400)
    //     .json({
    //       code: 400,
    //       message: "Company is not in DataBase. Incorrect Company",
    //     });
    //   // return res.status(409).send("User Already Exist. Please Login");
    // }
    //order validation
    const value = {
      name,
      unit,
      qty,
      acc_description,
      residual_value
    };
    const validateReports = await import_funds(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const report = await validateReports.save();

    return res
      .status(201)
      .json({ code: 200, message: "Success", report: report });
  } catch (err) {
    userLogger.error(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});
router.post("/invesment", async (req, res) => {
  // Our create logic starts here
  try {
    // Get user input
    const {
      volume_of_invest,
      org_funds,
      borrowed_funds,
      grants,
      other
    } = req.body;
    // // check if user already exist
    // // Validate if user exist in our database
    // const checkCompany = await Company_form.findById(company_id);
    // if (!checkCompany) {
    //   return res
    //     .status(400)
    //     .json({
    //       code: 400,
    //       message: "Company is not in DataBase. Incorrect Company",
    //     });
    //   // return res.status(409).send("User Already Exist. Please Login");
    // }
    //order validation
    const value = {
      volume_of_invest,
      org_funds,
      borrowed_funds,
      grants,
      other
    };
    const validateReports = await Invesment(value);
    // validation
    var error = validateReports.validateSync();
    if (error) {
      return res
        .status(409)
        .json({ code: 409, message: "Validatioan error", error: error });
    }
    const report = await validateReports.save();

    return res
      .status(201)
      .json({ code: 200, message: "Success", report: report });
  } catch (err) {
    userLogger.error(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error", err: err });
  }
  // Our register logic ends here
});




module.exports = router;
