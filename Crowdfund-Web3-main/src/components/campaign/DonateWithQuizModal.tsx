import { useState, useEffect } from "react";
import { LuckyWheelModal } from "./LuckyWheelModal";
import { QuizModal } from "./QuizModal";

interface DonateWithQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  campaignId?: string; // Optional - not used for game flow
  campaignName?: string; // Optional - not used for game flow
  userWoodCount?: number; // Number of wood/attempts user has
  onAttemptUsed?: () => void; // Callback when user fails quiz and loses attempt
}

export function DonateWithQuizModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  campaignId,
  campaignName,
  userWoodCount = 0,
  onAttemptUsed
}: DonateWithQuizModalProps) {
  const [stage, setStage] = useState<'wheel' | 'quiz' | 'donate' | 'closed' | 'no-wood'>('wheel');
  const [questionCount, setQuestionCount] = useState(0);

  // Reset stage when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Check if user has wood before starting
      if (userWoodCount <= 0) {
        setStage('no-wood');
      } else {
        setStage('wheel');
      }
      setQuestionCount(0);
    } else {
      setStage('closed');
    }
  }, [isOpen, userWoodCount]);

  const handleWheelSpinComplete = (number: number) => {
    setQuestionCount(number);
    setStage('quiz');
  };

  const handleQuizComplete = (passed: boolean) => {
    if (passed) {
      // User passed, call onSuccess directly (don't use DonateModal for game flow)
      onSuccess?.();
      onClose();
    } else {
      // User failed, lose attempt
      if (onAttemptUsed) {
        onAttemptUsed();
      }
      // Close after showing results
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleCloseAll = () => {
    setStage('closed');
    onClose();
  };

  // No wood warning modal
  if (stage === 'no-wood') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseAll} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🪵</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Không đủ gỗ!
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn cần có ít nhất <strong>1 gỗ</strong> để tham gia quiz và donate. 
                Thu hoạch gỗ từ trang trại để có thêm lượt chơi!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/game'}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all"
                >
                  🌳 Đi đến Trang trại
                </button>
                <button
                  onClick={handleCloseAll}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LuckyWheelModal 
        isOpen={isOpen && stage === 'wheel'}
        onClose={handleCloseAll}
        onSpinComplete={handleWheelSpinComplete}
      />
      
      <QuizModal 
        isOpen={stage === 'quiz'}
        onClose={handleCloseAll}
        onQuizComplete={handleQuizComplete}
        questionCount={questionCount}
      />
    </>
  );
}

