import { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, Award, TrendingDown } from "lucide-react";
import type { QuizQuestion } from "../../data/quizQuestions";
import { getRandomQuestions } from "../../data/quizQuestions";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizComplete: (passed: boolean, correctCount: number, totalCount: number) => void;
  questionCount: number;
}

export function QuizModal({ isOpen, onClose, onQuizComplete, questionCount }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: 'A' | 'B' | 'C' | 'D' }>({});
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && questionCount > 0) {
      // Generate random questions based on questionCount
      const randomQuestions = getRandomQuestions(questionCount);
      setQuestions(randomQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResult(false);
      setSubmitted(false);
    }
  }, [isOpen, questionCount]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSelectAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: answer
    });
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < totalQuestions) {
      alert(`Vui lòng trả lời tất cả ${totalQuestions} câu hỏi!`);
      return;
    }

    setSubmitted(true);
    setShowResult(true);
  };

  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return { correctCount, totalQuestions };
  };

  const handleFinish = () => {
    const { correctCount, totalQuestions } = calculateResults();
    const requiredCorrect = Math.ceil((totalQuestions * 2) / 3); // 2/3 requirement
    const passed = correctCount >= requiredCorrect;
    onQuizComplete(passed, correctCount, totalQuestions);
  };

  if (!isOpen || !currentQuestion) return null;

  const { correctCount } = submitted ? calculateResults() : { correctCount: 0 };
  const requiredCorrect = Math.ceil((totalQuestions * 2) / 3);
  const passed = correctCount >= requiredCorrect;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">📝 Câu hỏi về Sui Blockchain</h2>
                <p className="text-emerald-100 text-sm">
                  Trả lời đúng ≥ {requiredCorrect}/{totalQuestions} câu để được donate
                </p>
              </div>
              {!submitted && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Câu {currentQuestionIndex + 1}/{totalQuestions}</span>
                <span>{Object.keys(selectedAnswers).length}/{totalQuestions} đã trả lời</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Content */}
          {!showResult ? (
            <div className="p-6">
              {/* Category Badge */}
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                {currentQuestion.category}
              </div>

              {/* Question */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Câu {currentQuestionIndex + 1}. {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map((option) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(option)}
                        disabled={submitted}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                        } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {option}
                          </div>
                          <div className="flex-1 pt-1">
                            {currentQuestion.options[option]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Câu trước
                </button>
                
                <div className="flex-1" />

                {!isLastQuestion ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Câu sau →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(selectedAnswers).length < totalQuestions}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    Nộp bài
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="p-6">
              {/* Result Header */}
              <div className={`text-center mb-6 p-6 rounded-xl ${
                passed ? 'bg-gradient-to-br from-emerald-50 to-green-50' : 'bg-gradient-to-br from-red-50 to-orange-50'
              }`}>
                {passed ? (
                  <div>
                    <Award className="w-20 h-20 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-emerald-700 mb-2">
                      🎉 Chúc mừng! Bạn đã vượt qua!
                    </h3>
                    <p className="text-emerald-600 text-lg">
                      Bạn trả lời đúng {correctCount}/{totalQuestions} câu
                    </p>
                    <p className="text-gray-600 mt-2">
                      Bạn có thể tiếp tục donate cho chiến dịch này!
                    </p>
                  </div>
                ) : (
                  <div>
                    <TrendingDown className="w-20 h-20 text-red-600 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-red-700 mb-2">
                      😢 Rất tiếc!
                    </h3>
                    <p className="text-red-600 text-lg">
                      Bạn chỉ trả lời đúng {correctCount}/{totalQuestions} câu
                    </p>
                    <p className="text-gray-600 mt-2">
                      Cần đúng ít nhất {requiredCorrect} câu. Bạn đã mất 1 lượt chơi.
                    </p>
                  </div>
                )}
              </div>

              {/* Answer Review */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h4 className="font-bold text-lg text-gray-900 sticky top-0 bg-white pb-2">
                  Đáp án chi tiết:
                </h4>
                {questions.map((q, index) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <div key={q.id} className={`p-4 rounded-lg border-2 ${
                      isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">
                            Câu {index + 1}. {q.question}
                          </p>
                          <div className="text-sm space-y-1">
                            <p className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                              <strong>Bạn chọn:</strong> {userAnswer}. {q.options[userAnswer]}
                            </p>
                            {!isCorrect && (
                              <p className="text-emerald-700">
                                <strong>✅ Đáp án đúng:</strong> {q.correctAnswer}. {q.options[q.correctAnswer]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Finish Button */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={handleFinish}
                  className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 ${
                    passed 
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                  }`}
                >
                  {passed ? '✅ Tiếp tục Donate' : '❌ Đóng'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

