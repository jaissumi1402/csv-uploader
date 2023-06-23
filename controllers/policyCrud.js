const Policy = require("../models/policy");

// Create a new Policy
const createPolicy = async (req, res) => {
  try {
    const {
      policy_number,
      premium_amount,
      premium_amount_written,
      policyMode,
      policy_type,
      policy_start_date,
      policy_end_date,
      csr,
      user,
      agent,
      lob,
      carrier,
    } = req.body;

    if (
      !policy_number ||
      !premium_amount ||
      !policy_start_date ||
      !policy_end_date ||
      !csr ||
      !user ||
      !agent ||
      !lob ||
      !carrier
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: policy_number, premium_amount, policy_start_date, policy_end_date, csr, user, agent, lob, carrier",
      });
    }

    const policy = new Policy({
      policy_number,
      premium_amount,
      premium_amount_written,
      policyMode,
      policy_type,
      policy_start_date,
      policy_end_date,
      csr,
      user,
      agent,
      lob,
      carrier,
    });
    await policy.save();

    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Policies
const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().populate("user agent lob carrier");
    res.status(200).json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single Policy by ID
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Policy ID not provided" });
    }

    const policy = await Policy.findById(id).populate("user agent lob carrier");

    if (!policy) {
      res.status(404).json({ success: false, error: "Policy not found" });
    } else {
      res.status(200).json({ success: true, data: policy });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a Policy by ID
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      policy_number,
      premium_amount,
      premium_amount_written,
      policyMode,
      policy_type,
      policy_start_date,
      policy_end_date,
      csr,
      user,
      agent,
      lob,
      carrier,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Policy ID not provided" });
    }

    const policy = await Policy.findByIdAndUpdate(
      id,
      {
        policy_number,
        premium_amount,
        premium_amount_written,
        policyMode,
        policy_type,
        policy_start_date,
        policy_end_date,
        csr,
        user,
        agent,
        lob,
        carrier,
      },
      { new: true }
    ).populate("user agent lob carrier");

    if (!policy) {
      res.status(404).json({ success: false, error: "Policy not found" });
    } else {
      res.status(200).json({ success: true, data: policy });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a Policy by ID
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Policy ID not provided" });
    }

    const policy = await Policy.findByIdAndDelete(id).populate(
      "user agent lob carrier"
    );

    if (!policy) {
      res.status(404).json({ success: false, error: "Policy not found" });
    } else {
      res.status(200).json({ success: true, data: policy });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
};
