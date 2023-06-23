const mongoose = require('mongoose');

const lobSchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  }
});

const LOB = mongoose.model('LOB', lobSchema);
module.exports = LOB