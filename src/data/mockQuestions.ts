import { Question } from '@/types/quiz'

export const mockQuestions: Question[] = [
  // 選択問題
  {
    id: 'q1',
    type: 'multiple-choice',
    question: '微積分の基本定理において、導関数と積分の関係について正しい説明はどれですか？',
    choices: [
      '導関数と積分は全く関係がない',
      '導関数と積分は逆演算の関係にある',
      '導関数は積分の一部である',
      '積分は導関数の一部である'
    ],
    correctAnswer: 1,
    explanation: '微積分の基本定理により、導関数と積分は逆演算の関係にあります。つまり、ある関数を微分してから積分すると元の関数（定数項を除く）に戻ります。',
    tags: ['数学', '微積分'],
    difficulty: 'standard'
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: '江戸時代の幕藩体制の特徴として正しくないものはどれですか？',
    choices: [
      '将軍を頂点とする封建制度',
      '大名による藩の統治',
      '四民平等の身分制度',
      '参勤交代による統制'
    ],
    correctAnswer: 2,
    explanation: '江戸時代は士農工商の身分制度があり、四民平等ではありませんでした。明確な身分制度が存在していました。',
    tags: ['歴史', '江戸時代'],
    difficulty: 'basic'
  },
  {
    id: 'q3',
    type: 'true-false',
    question: 'ReactのuseStateフックは、関数コンポーネント内でのみ使用できる。',
    options: ['正しい', '間違い'],
    correctAnswer: '正しい',
    explanation: 'useStateフックは関数コンポーネント内でのみ使用できます。クラスコンポーネントではthis.stateを使用します。',
    tags: ['プログラミング', 'React'],
    difficulty: 'basic'
  },
  {
    id: 'q4',
    type: 'essay',
    question: '夏目漱石の「こころ」における主人公「先生」の心理状態について、作品中の具体的な描写を挙げながら説明してください。',
    correctAnswer: 'サンプル回答：先生は過去の罪悪感に苦しんでいる。友人への裏切りや自己嫌悪、絶望感が描かれている。',
    explanation: '「こころ」では先生の複雑な内面が丁寧に描写されており、過去の出来事への後悔と自己嫌悪が主要なテーマとなっています。',
    tags: ['文学', '夏目漱石'],
    difficulty: 'advanced'
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    question: '電磁気学におけるクーロンの法則の式として正しいものはどれですか？',
    choices: [
      'F = ma',
      'F = k(q₁q₂)/r²',
      'F = mg',
      'F = qE'
    ],
    correctAnswer: 1,
    explanation: 'クーロンの法則は F = k(q₁q₂)/r² で表され、電荷間に働く力は電荷の積に比例し、距離の2乗に反比例します。',
    tags: ['物理', '電磁気学'],
    difficulty: 'standard'
  },
  {
    id: 'q6',
    type: 'true-false',
    question: '市場経済において、需要曲線は右上がりである。',
    options: ['正しい', '間違い'],
    correctAnswer: '間違い',
    explanation: '需要曲線は右下がりです。価格が上昇すると需要量は減少し、価格が下降すると需要量は増加します。',
    tags: ['経済学', '需要供給'],
    difficulty: 'basic'
  },
  {
    id: 'q7',
    type: 'multiple-choice',
    question: 'データ構造において、スタック（Stack）の特徴として正しいものはどれですか？',
    choices: [
      'FIFO（First In, First Out）',
      'LIFO（Last In, First Out）',
      'ランダムアクセス可能',
      '要素の順序は関係ない'
    ],
    correctAnswer: 1,
    explanation: 'スタックはLIFO（Last In, First Out：後入れ先出し）の特徴を持つデータ構造です。',
    tags: ['プログラミング', 'データ構造'],
    difficulty: 'basic'
  },
  {
    id: 'q8',
    type: 'essay',
    question: '心理学における「オペラント条件づけ」について、具体例を挙げながら説明してください。',
    correctAnswer: 'サンプル回答：行動の結果による学習。正の強化（報酬）で行動頻度が増加。例：良い成績で褒められると勉強時間が増える。',
    explanation: 'オペラント条件づけは、行動の結果によって学習が起こる現象で、強化や弱化によって行動の頻度が変化します。',
    tags: ['心理学', '学習理論'],
    difficulty: 'standard'
  },
  {
    id: 'q9',
    type: 'true-false',
    question: '生物学において、ミトコンドリアは「細胞の発電所」と呼ばれる。',
    options: ['正しい', '間違い'],
    correctAnswer: '正しい',
    explanation: 'ミトコンドリアはATP合成を行う細胞小器官で、細胞のエネルギー産生の中心的役割を果たすため「細胞の発電所」と呼ばれます。',
    tags: ['生物学', '細胞構造'],
    difficulty: 'basic'
  },
  {
    id: 'q10',
    type: 'multiple-choice',
    question: '第二次世界大戦が終結した年はいつですか？',
    choices: [
      '1944年',
      '1945年',
      '1946年',
      '1947年'
    ],
    correctAnswer: 1,
    explanation: '第二次世界大戦は1945年9月2日に日本の降伏により正式に終結しました。',
    tags: ['歴史', '世界史'],
    difficulty: 'basic'
  }
]