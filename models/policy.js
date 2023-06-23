const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policy_number: {
    type: String,
    required: true,
  },
  premium_amount: {
    type: Number,
    required: true,
  },
  premium_amount_written: {
    type: Number
  },
  policyMode: {
    type: Number
  },
  policy_type: {
    type: String
  },
  policy_start_date: {
    type: Date,
    required: true,
  },
  policy_end_date: {
    type: Date,
    required: true,
  },
  csr: {
    type: String,
    required: true,
  },
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  agent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  }],
  lob: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LOB',
    required: true,
  }],
  carrier: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    required: true,
  }],
});

const Policy = mongoose.model('Policy', policySchema);
module.exports = Policy