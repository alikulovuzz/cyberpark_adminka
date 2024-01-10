const express = require("express");
const user=require('./user')
const reports = require('./reports')
const audit = require('./audit_report')
const company = require('./company')

const company_form = require('./company_form');
const application_form = require('./application_form');
const file_uploads = require('./file_uploads');
const { verifyToken, isAdmin, userCheck, permissionCheck } = require("../middleware/auth");
const rateLimit = require('../middleware/request_limitter')



var router = express.Router();
router.use('/user', user);
router.use('/company',verifyToken,userCheck,permissionCheck(['admin']), company);
router.use('/company_form', company_form);
router.use('/upload', file_uploads);
router.use('/reports',verifyToken, reports);
router.use('/audit',verifyToken, audit);
router.use('/application_form', application_form);
router.use('/welcome', (req, res) => {
    res.json({ name: "Hello" })
})

module.exports = router
