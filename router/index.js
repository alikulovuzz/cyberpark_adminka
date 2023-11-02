const express = require("express");
const user=require('./user')
const reports = require('./reports')
const audit = require('./audit_report')
const company = require('./company')
const company_form = require('./company_form')
const file_uploads = require('./file_uploads');
const { verifyToken, isAdmin } = require("../middleware/auth");


var router = express.Router();
router.use('/user', user);
router.use('/company',verifyToken,isAdmin, company);
router.use('/company_form', company_form);
router.use('/upload',verifyToken, file_uploads);
router.use('/reports',verifyToken, reports);
router.use('/audit',verifyToken, audit);
router.use('/welcome', (req, res) => {
    res.json({ name: "Hello" })
})

module.exports = router
