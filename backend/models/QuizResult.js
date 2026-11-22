const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionIndex: Number,
    selected: { type: String, default: null },
    isCorrect: Boolean,
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: [answerSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);