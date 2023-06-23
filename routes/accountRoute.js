const express = require('express');
const {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount
} = require('../controllers/accountCrud');

const router = express.Router();

// Create a new Account
router.post('/createAccount', createAccount);

// Get all Accounts
router.get('/getAllAccounts', getAllAccounts);

// Get a single Account by ID
router.get('/getAccount/:id', getAccountById);

// Update an Account by ID
router.put('/updateAccount/:id', updateAccount);

// Delete an Account by ID
router.delete('/deleteAccount/:id', deleteAccount);

module.exports = router;
