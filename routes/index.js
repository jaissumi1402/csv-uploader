const express = require("express");
const router = express.Router();

const fileUploadRoute = require("./fileUploadRoute");
const userRoute = require("./userRoute");
const accountRoute = require("./accountRoute");
const policyRoute = require("./policyRoute");

router.use("/api/upload", fileUploadRoute);
router.use("/", userRoute);
router.use("/", accountRoute);
router.use("/", policyRoute);

module.exports = router;
