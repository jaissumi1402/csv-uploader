const express = require('express');
const {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy
} = require('../controllers/policyCrud');

const router = express.Router();

// Create a new Policy
router.post('/createPolicy', createPolicy);

// Get all Policies
router.get('/getAllPolicies', getAllPolicies);

// Get a single Policy by ID
router.get('/getPolicy/:id', getPolicyById);

// Update a Policy by ID
router.put('/updatePolicy/:id', updatePolicy);

// Delete a Policy by ID
router.delete('/deletePolicy/:id', deletePolicy);

module.exports = router;
