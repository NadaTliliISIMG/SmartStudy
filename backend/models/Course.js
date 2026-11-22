const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Course', courseSchema);