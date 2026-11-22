const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: [(v) => v.length === 4, 'A question must have 4 options'],
    },
    correctAnswer: { type: String, required: true },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    questions: { type: [questionSchema], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Quiz', quizSchema);