const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a board name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    columns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', boardSchema);
