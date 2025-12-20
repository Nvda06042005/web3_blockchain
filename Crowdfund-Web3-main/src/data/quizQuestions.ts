export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  category: string;
}

export const quizQuestions: QuizQuestion[] = [
  // 1️⃣ Cơ bản về Sui
  {
    id: 1,
    question: "Sui là gì?",
    options: {
      A: "Một blockchain Layer 2 của Ethereum",
      B: "Một blockchain Layer 1 hiệu năng cao",
      C: "Một sidechain của Solana",
      D: "Một nền tảng Web2 tích hợp AI"
    },
    correctAnswer: 'B',
    category: "Cơ bản về Sui"
  },
  {
    id: 2,
    question: "Sui được phát triển bởi tổ chức nào?",
    options: {
      A: "Ethereum Foundation",
      B: "Solana Labs",
      C: "Mysten Labs",
      D: "Binance Labs"
    },
    correctAnswer: 'C',
    category: "Cơ bản về Sui"
  },
  {
    id: 3,
    question: "Điểm khác biệt cốt lõi của Sui so với Ethereum là gì?",
    options: {
      A: "Dùng Proof of Work",
      B: "Dùng account-based model",
      C: "Dùng object-centric model",
      D: "Không có smart contract"
    },
    correctAnswer: 'C',
    category: "Cơ bản về Sui"
  },
  {
    id: 4,
    question: "Ngôn ngữ lập trình chính của Sui là gì?",
    options: {
      A: "Solidity",
      B: "Rust",
      C: "Move",
      D: "Vyper"
    },
    correctAnswer: 'C',
    category: "Cơ bản về Sui"
  },
  {
    id: 5,
    question: "Sui thuộc loại blockchain nào?",
    options: {
      A: "Layer 2",
      B: "Sidechain",
      C: "Layer 1",
      D: "Private chain"
    },
    correctAnswer: 'C',
    category: "Cơ bản về Sui"
  },
  {
    id: 6,
    question: "Phí giao dịch trên Sui được thanh toán bằng token nào?",
    options: {
      A: "ETH",
      B: "SOL",
      C: "MOVE",
      D: "SUI"
    },
    correctAnswer: 'D',
    category: "Cơ bản về Sui"
  },
  {
    id: 7,
    question: "Token SUI KHÔNG được dùng cho mục đích nào?",
    options: {
      A: "Trả phí gas",
      B: "Staking",
      C: "Governance",
      D: "Đào coin (mining)"
    },
    correctAnswer: 'D',
    category: "Cơ bản về Sui"
  },

  // 2️⃣ Object Model & Move
  {
    id: 8,
    question: 'Trong Sui, "object" là gì?',
    options: {
      A: "Một tài khoản người dùng",
      B: "Một hợp đồng thông minh",
      C: "Một thực thể có owner, ID và trạng thái",
      D: "Một block trong blockchain"
    },
    correctAnswer: 'C',
    category: "Object Model & Move"
  },
  {
    id: 9,
    question: "Owned Object có đặc điểm nào?",
    options: {
      A: "Ai cũng có thể truy cập",
      B: "Chỉ một địa chỉ sở hữu",
      C: "Luôn cần consensus",
      D: "Không thể chuyển nhượng"
    },
    correctAnswer: 'B',
    category: "Object Model & Move"
  },
  {
    id: 10,
    question: "Shared Object khác Owned Object ở điểm nào?",
    options: {
      A: "Không có owner",
      B: "Không cần consensus",
      C: "Nhiều người cùng truy cập",
      D: "Không thể thay đổi trạng thái"
    },
    correctAnswer: 'C',
    category: "Object Model & Move"
  },
  {
    id: 11,
    question: "Vì sao Sui xử lý song song tốt?",
    options: {
      A: "Block time ngắn",
      B: "Có ít validator",
      C: "Giao dịch chỉ khóa object liên quan",
      D: "Không dùng consensus"
    },
    correctAnswer: 'C',
    category: "Object Model & Move"
  },
  {
    id: 12,
    question: "Move trên Sui khác Move trên Aptos ở điểm nào?",
    options: {
      A: "Không hỗ trợ NFT",
      B: "Không hỗ trợ smart contract",
      C: "Áp dụng mô hình object-centric",
      D: "Không hỗ trợ parallel execution"
    },
    correctAnswer: 'C',
    category: "Object Model & Move"
  },
  {
    id: 13,
    question: "Sui ngăn double-spend bằng cách nào?",
    options: {
      A: "Dùng gas cao",
      B: "Dùng nonce",
      C: "Kiểm soát version của object",
      D: "Dùng Proof of Work"
    },
    correctAnswer: 'C',
    category: "Object Model & Move"
  },
  {
    id: 14,
    question: "Transaction Block trong Sui là gì?",
    options: {
      A: "Một block chứa nhiều giao dịch",
      B: "Một nhóm thao tác thực thi atomically",
      C: "Một smart contract",
      D: "Một object đặc biệt"
    },
    correctAnswer: 'B',
    category: "Object Model & Move"
  },
  {
    id: 15,
    question: "Gas sponsorship trong Sui có nghĩa là gì?",
    options: {
      A: "Validator trả gas",
      B: "Người dùng không cần gas",
      C: "dApp trả gas thay người dùng",
      D: "Gas được miễn hoàn toàn"
    },
    correctAnswer: 'C',
    category: "Object Model & Move"
  },

  // 3️⃣ NFT & GameFi
  {
    id: 16,
    question: "Vì sao Sui phù hợp cho GameFi?",
    options: {
      A: "Phí cao, bảo mật tốt",
      B: "NFT là static asset",
      C: "NFT là object có thể thay đổi trạng thái",
      D: "Không cần blockchain"
    },
    correctAnswer: 'C',
    category: "NFT & GameFi"
  },
  {
    id: 17,
    question: "Dynamic NFT trên Sui cho phép điều gì?",
    options: {
      A: "Chỉ hiển thị hình ảnh",
      B: "Thay đổi metadata theo thời gian",
      C: "Không thể chuyển nhượng",
      D: "Không thể nâng cấp"
    },
    correctAnswer: 'B',
    category: "NFT & GameFi"
  },
  {
    id: 18,
    question: "Phygital NFT là gì?",
    options: {
      A: "NFT chỉ dùng trong game",
      B: "NFT đại diện cho tài sản vật lý",
      C: "NFT miễn phí",
      D: "NFT chỉ dùng Web2"
    },
    correctAnswer: 'B',
    category: "NFT & GameFi"
  },
  {
    id: 19,
    question: "Vì sao NFT trên Sui khó bị làm giả?",
    options: {
      A: "NFT không có metadata",
      B: "NFT không thể chuyển nhượng",
      C: "Object có ID duy nhất và traceable",
      D: "Chỉ admin tạo được NFT"
    },
    correctAnswer: 'C',
    category: "NFT & GameFi"
  },
  {
    id: 20,
    question: "Sui có hỗ trợ chuyển NFT trực tiếp P2P không?",
    options: {
      A: "Không",
      B: "Chỉ qua marketplace",
      C: "Chỉ qua bridge",
      D: "Có"
    },
    correctAnswer: 'D',
    category: "NFT & GameFi"
  },

  // 4️⃣ DeFi trên Sui
  {
    id: 21,
    question: "Ưu điểm của DeFi trên Sui là gì?",
    options: {
      A: "Gas cao",
      B: "Xử lý tuần tự",
      C: "Song song, phí thấp",
      D: "Không có smart contract"
    },
    correctAnswer: 'C',
    category: "DeFi trên Sui"
  },
  {
    id: 22,
    question: "Sui có hỗ trợ AMM và Lending không?",
    options: {
      A: "Không",
      B: "Chỉ AMM",
      C: "Chỉ Lending",
      D: "Có đầy đủ"
    },
    correctAnswer: 'D',
    category: "DeFi trên Sui"
  },
  {
    id: 23,
    question: "Object-centric giúp giảm MEV bằng cách nào?",
    options: {
      A: "Tăng block time",
      B: "Không có global mempool",
      C: "Cấm validator",
      D: "Tăng phí gas"
    },
    correctAnswer: 'B',
    category: "DeFi trên Sui"
  },
  {
    id: 24,
    question: "Liquidity pool trong Sui thường được biểu diễn dưới dạng gì?",
    options: {
      A: "Account",
      B: "Block",
      C: "Shared Object",
      D: "Owned Object"
    },
    correctAnswer: 'C',
    category: "DeFi trên Sui"
  },

  // 5️⃣ Bảo mật & Consensus
  {
    id: 25,
    question: "Sui sử dụng cơ chế đồng thuận nào?",
    options: {
      A: "Proof of Work",
      B: "Proof of Authority",
      C: "Narwhal & Bullshark (BFT)",
      D: "Delegated Proof of Stake"
    },
    correctAnswer: 'C',
    category: "Bảo mật & Consensus"
  },
  {
    id: 26,
    question: "Vì sao nhiều giao dịch trên Sui không cần consensus toàn mạng?",
    options: {
      A: "Không cần validator",
      B: "Giao dịch chỉ liên quan Owned Object",
      C: "Không ghi blockchain",
      D: "Không cần bảo mật"
    },
    correctAnswer: 'B',
    category: "Bảo mật & Consensus"
  },
  {
    id: 27,
    question: "Replay attack bị ngăn chặn trên Sui nhờ đâu?",
    options: {
      A: "Block time",
      B: "Gas fee",
      C: "Version của object",
      D: "Hash của block"
    },
    correctAnswer: 'C',
    category: "Bảo mật & Consensus"
  },
  {
    id: 28,
    question: "Ưu điểm bảo mật lớn nhất của Move là gì?",
    options: {
      A: "Dễ viết",
      B: "Hỗ trợ JavaScript",
      C: "Ownership & resource safety",
      D: "Không cần test"
    },
    correctAnswer: 'C',
    category: "Bảo mật & Consensus"
  }
];

// Helper function to get random questions
export function getRandomQuestions(count: number): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

