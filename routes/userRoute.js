const express = require("express");
const router = express.Router();
const userCrud = require("../controllers/userCrud");

// Create a new User
router.post("/createUser", userCrud.createUser);

// Get all Users
router.get("/getAllUsers", userCrud.getAllUsers);

// Get a single User by ID
router.get("/getUser/:id", userCrud.getUserById);

// Update a User by ID
router.put("/updateUser/:id", userCrud.updateUser);

// Delete a User by ID
router.delete("/deleteUser/:id", userCrud.deleteUser);

module.exports = router;
