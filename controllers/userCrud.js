const User = require("../models/user");

// Create a new User
const createUser = async (req, res) => {
  try {
    const {
      userType,
      policy_number,
      account_name,
      email,
      gender,
      name,
      city,
      phone,
      address,
      state,
      zip,
      dob,
    } = req.body;

    if (!email || !name || !phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email, name, phone",
      });
    }

    const newUser = new User({
      userType,
      policy_number,
      account_name,
      email,
      gender,
      name,
      city,
      phone,
      address,
      state,
      zip,
      dob,
    });

    await newUser.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single User by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "User ID not provided" });
    }
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
    } else {
      res.status(200).json({ success: true, data: user });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a User by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "User ID not provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      res.status(404).json({ success: false, error: "User not found" });
    } else {
      res.status(200).json({ success: true, data: updatedUser });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a User by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "User ID not provided" });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).json({ success: false, error: "User not found" });
    } else {
      res.status(200).json({ success: true, data: deletedUser });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
