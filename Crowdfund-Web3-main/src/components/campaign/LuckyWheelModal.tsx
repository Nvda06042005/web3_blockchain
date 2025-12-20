import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinComplete: (number: number) => void;
}

export function LuckyWheelModal({ isOpen, onClose, onSpinComplete }: LuckyWheelModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);
    
    // Generate random number from 1-10
    const finalNumber = Math.floor(Math.random() * 10) + 1;
    
    // Spin animation - rotate multiple times plus final position
    const spins = 5; // Number of full rotations
    const finalRotation = rotation + (360 * spins) + ((finalNumber - 1) * 36);
    setRotation(finalRotation);

    // Animate through numbers during spin
    let count = 0;
    const interval = setInterval(() => {
      setCurrentNumber(Math.floor(Math.random() * 10) + 1);
      count++;
      if (count > 20) {
        clearInterval(interval);
      }
    }, 100);

    // Complete spin after animation
    setTimeout(() => {
      clearInterval(interval);
      setCurrentNumber(finalNumber);
      setResult(finalNumber);
      setSpinning(false);
      
      // Wait a bit before triggering quiz
      setTimeout(() => {
        onSpinComplete(finalNumber);
      }, 1500);
    }, 3000);
  };

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setCurrentNumber(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={!spinning ? onClose : undefined} />
        
        <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl shadow-2xl max-w-lg w-full p-8 border-4 border-emerald-300">
          {!spinning && !result && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Vòng Quay May Mắn
              </h2>
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-600">
              Quay để nhận số câu hỏi trắc nghiệm về Sui!
            </p>
          </div>

          {/* Lucky Wheel */}
          <div className="relative mb-8">
            {/* Wheel Container */}
            <div className="relative w-64 h-64 mx-auto">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg" />
              </div>

              {/* Wheel */}
              <div 
                className="w-full h-full rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden transition-transform duration-3000 ease-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: 'conic-gradient(from 0deg, #10b981 0deg 36deg, #3b82f6 36deg 72deg, #f59e0b 72deg 108deg, #ef4444 108deg 144deg, #8b5cf6 144deg 180deg, #ec4899 180deg 216deg, #14b8a6 216deg 252deg, #f97316 252deg 288deg, #06b6d4 288deg 324deg, #84cc16 324deg 360deg)'
                }}
              >
                {/* Number segments */}
                {numbers.map((num, index) => {
                  const angle = (index * 36) - 18; // Center each number in its segment
                  return (
                    <div
                      key={num}
                      className="absolute top-1/2 left-1/2 origin-left"
                      style={{
                        transform: `rotate(${angle}deg) translateX(70px)`,
                        width: '40px',
                        height: '40px',
                        marginLeft: '-20px',
                        marginTop: '-20px'
                      }}
                    >
                      <div 
                        className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                        style={{ transform: `rotate(-${angle + rotation}deg)` }}
                      >
                        {num}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-lg z-20">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            {/* Current Number Display */}
            <div className="mt-6 text-center">
              <div className="inline-block px-8 py-4 bg-white rounded-2xl shadow-lg border-2 border-emerald-300">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {currentNumber}
                </div>
                {result && (
                  <div className="text-sm text-gray-600 mt-1">
                    Bạn nhận được {result} câu hỏi!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spin Button */}
          {!spinning && !result && (
            <button
              onClick={handleSpin}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🎰 QUAY NGAY!
            </button>
          )}

          {spinning && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 rounded-full">
                <div className="animate-spin w-5 h-5 border-3 border-emerald-600 border-t-transparent rounded-full" />
                <span className="font-semibold text-gray-700">Đang quay...</span>
              </div>
            </div>
          )}

          {result && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full font-semibold">
                <Sparkles className="w-5 h-5" />
                Chuẩn bị câu hỏi...
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-600 bg-white/50 rounded-lg p-3">
            💡 Trả lời đúng ≥ 2/3 câu hỏi để có thể donate!
          </div>
        </div>
      </div>
    </div>
  );
}

