const Account = require("../models/account");
const User = require("../models/user");

// Create a new Account
const createAccount = async (req, res) => {
  try {
    const { account_name, account_type, user } = req.body;

    if (!account_name || !account_type || !user) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Missing required fields: account_name, account_type, user",
        });
    }

    const account = new Account({ account_name, account_type, user });
    await account.save();

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Accounts
const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().populate("user");

    const uniqueAccountsMap = new Map();

    for (const account of accounts) {
      const { account_name, account_type, user } = account;

      if (uniqueAccountsMap.has(account_name)) {
        const existingAccount = uniqueAccountsMap.get(account_name);
        existingAccount.user.push(...user);
      } else {
        uniqueAccountsMap.set(account_name, {
          account_name,
          account_type,
          user,
        });
      }
    }

    const uniqueAccounts = [...uniqueAccountsMap.values()];

    return res.status(200).json({ accounts: uniqueAccounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single Account by ID
const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Account ID not provided" });
    }

    const account = await Account.findById(id).populate("user");

    if (!account) {
      res.status(404).json({ success: false, error: "Account not found" });
    } else {
      const { account_name, account_type } = account;

      const accountsWithSameName = await Account.find({
        account_name,
        _id: { $ne: id },
      }).populate("user");

      const mergedUsers = [...account.user];
      for (const sameNameAccount of accountsWithSameName) {
        mergedUsers.push(...sameNameAccount.user);
      }

      const mergedAccount = {
        account_name,
        account_type,
        user: mergedUsers,
      };

      res.status(200).json({ success: true, data: mergedAccount });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update an Account by ID
const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_name, account_type, user } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Account ID not provided" });
    }

    const account = await Account.findByIdAndUpdate(
      id,
      { account_name, account_type, user },
      { new: true }
    ).populate("user");

    if (!account) {
      res.status(404).json({ success: false, error: "Account not found" });
    } else {
      res.status(200).json({ success: true, data: account });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete an Account by ID
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Account ID not provided" });
    }

    const account = await Account.findByIdAndDelete(id).populate("user");

    if (!account) {
      res.status(404).json({ success: false, error: "Account not found" });
    } else {
      res.status(200).json({ success: true, data: account });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
