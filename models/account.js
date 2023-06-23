const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  account_name: {
    type: String,
    required: true,
  },
  account_type: {
    type: String,
    required: true,
  },
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account
