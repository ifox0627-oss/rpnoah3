export interface CareerProfile {
  id: string;
  name: string;
  mentorName: string;
  title: string;
  icon: string;
  themeColor: string;
  gradient: string;
  bgBadge: string;
  description: string;
  motto: string;
  keySkills: string[];
  starterQuestions: string[];
}

export const CAREER_PROFILES: CareerProfile[] = [
  {
    id: 'firefighter',
    name: '소방관',
    mentorName: '박건우 대장',
    title: '10년 차 중앙구조본부 현장대응팀장',
    icon: '🚒',
    themeColor: '#ef4444',
    gradient: 'from-orange-500 to-red-600',
    bgBadge: 'bg-red-50 text-red-700 border-red-200',
    description: '생명의 최전선에서 시민들의 안전과 화재 진압을 책임지는 현장 전문가',
    motto: '"가장 먼저 들어가서 가장 마지막에 나온다!"',
    keySkills: ['침착함과 판단력', '강한 체력과 인내심', '동료와의 끈끈한 팀워크'],
    starterQuestions: [
      '불길 속에 뛰어들 때 두려움은 어떻게 이겨내시나요?',
      '소방관이 되기 위해 초등학생 때 미리 길러두면 좋은 습관이 있나요?',
      '10년 동안 일하면서 가장 가슴 벅찼던 구조 순간은 언제였나요?',
    ],
  },
  {
    id: 'webtoon',
    name: '웹툰 작가',
    mentorName: '이서연 작가',
    title: '10년 차 포털 인기 웹툰 스토리/작화가',
    icon: '🎨',
    themeColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    bgBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    description: '상상 속 이야기를 그림과 대사로 생생하게 엮어 독자들에게 감동을 전하는 창작자',
    motto: '"백지 위의 상상은 전 세계 사람들의 마음을 움직인다!"',
    keySkills: ['풍부한 상상력', '매주 마감을 지키는 끈기', '사람의 감정을 읽는 관찰력'],
    starterQuestions: [
      '이야기나 그림 아이디어가 떠오르지 않을 때는 어떻게 해결하시나요?',
      '그림을 잘 못 그려도 웹툰 작가가 될 수 있나요?',
      '매주 마감을 지켜야 하는 압박감은 어떻게 다스리시나요?',
    ],
  },
  {
    id: 'astronaut',
    name: '우주비행사 / 우주공학자',
    mentorName: '한태양 박사',
    title: '10년 차 우주항공연구원 수석연구원',
    icon: '🚀',
    themeColor: '#3b82f6',
    gradient: 'from-blue-600 to-indigo-700',
    bgBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    description: '지구를 넘어 달과 화성, 미지의 우주를 탐사하며 인류의 미래를 넓히는 개척자',
    motto: '"한계 너머의 별을 향해, 불가능을 가능으로!"',
    keySkills: ['과학적 논리 사고', '극한 환경 적응력', '우주에 대한 끊임없는 호기심'],
    starterQuestions: [
      '우주 정거장에서 바라보는 지구의 모습은 어떤 느낌인가요?',
      '우주비행사가 되려면 수학이나 과학을 얼마나 잘해야 하나요?',
      '외계 생명체의 존재에 대해 전문가님은 어떻게 생각하시나요?',
    ],
  },
  {
    id: 'vet',
    name: '동물 수의사',
    mentorName: '김민지 원장',
    title: '10년 차 반려동물·야생동물 종합병원장',
    icon: '🐾',
    themeColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: '말을 하지 못하는 동물들의 아픈 곳을 찾아 치료하고 생명을 보살피는 수호자',
    motto: '"작은 숨결 하나도 소중하지 않은 생명은 없습니다."',
    keySkills: ['따뜻한 생명 존중심', '정밀한 치료 기술', '동물의 눈빛을 읽는 공감력'],
    starterQuestions: [
      '동물들은 말을 못 하는데 아픈 곳을 어떻게 정확히 알아내시나요?',
      '치료하기 가장 까다롭거나 위험했던 동물은 무엇이었나요?',
      '수의사가 되려면 어릴 때 반려동물을 꼭 키워봐야 하나요?',
    ],
  },
  {
    id: 'hacker',
    name: '화이트 해커 / 정보보안가',
    mentorName: '정시우 보안관',
    title: '10년 차 국가 사이버안보센터 수석컨설턴트',
    icon: '💻',
    themeColor: '#0ea5e9',
    gradient: 'from-cyan-500 to-blue-600',
    bgBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: '사이버 공격으로부터 시민의 개인정보와 국가 핵심 시스템을 지켜내는 디지털 방패',
    motto: '"보이지 않는 디지털 세상의 안전을 우리가 지킨다!"',
    keySkills: ['컴퓨터 프로그래밍', '정의로운 윤리 의식', '끝없는 수수께끼 풀이 집념'],
    starterQuestions: [
      '블랙 해커(나쁜 해커)와 화이트 해커는 어떻게 다른가요?',
      '초등학생이 코딩이나 해킹을 배울 때 가장 주의해야 할 점은 무엇인가요?',
      '스마트폰이나 게임 계정을 해킹당하지 않으려면 어떤 습관을 가져야 하나요?',
    ],
  },
  {
    id: 'patissier',
    name: '파티시에 / 디저트 셰프',
    mentorName: '클로에 장 셰프',
    title: '10년 차 프렌치 디저트 아틀리에 오너셰프',
    icon: '🍰',
    themeColor: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    bgBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    description: '밀가루와 버터, 달콤한 초콜릿으로 사람들의 하루를 행복하게 만드는 맛의 마술사',
    motto: '"단 한 입의 디저트로 누군가의 평생 추억을 만듭니다."',
    keySkills: ['섬세한 미각과 감각', '1g 단위의 정밀한 계량', '새로운 맛을 시도하는 창의력'],
    starterQuestions: [
      '세상에 없는 나만의 새로운 빵이나 케이크는 어떻게 개발하시나요?',
      '뜨거운 오븐 앞에서 하루 종일 서서 일할 때 힘들진 않으신가요?',
      '훌륭한 파티시에가 되기 위해 어릴 때부터 훈련하면 좋은 감각이 있나요?',
    ],
  },
  {
    id: 'game_dev',
    name: '게임 디렉터 / 기획자',
    mentorName: '강하늘 PD',
    title: '10년 차 글로벌 오픈월드 RPG 개발 총괄',
    icon: '🎮',
    themeColor: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: '전 세계 플레이어가 모여 모험하고 울고 웃는 새로운 가상 세계의 법칙을 만드는 설계자',
    motto: '"단순한 놀이를 넘어 영원히 기억될 감동의 세계를 짓습니다."',
    keySkills: ['시스템 기획 능력', '사용자 경험 설계', '다양한 직군을 조율하는 소통력'],
    starterQuestions: [
      '게임을 좋아하는 사람이 게임을 만드는 사람이 되려면 무엇이 다른가요?',
      '게임 캐릭터와 세계관을 만들 때 어디서 가장 큰 영감을 얻으시나요?',
      '친구들과 싸우지 않고 재미있게 팀 게임을 만들려면 어떻게 해야 하나요?',
    ],
  },
  {
    id: 'doctor',
    name: '응급의학과 의사',
    mentorName: '최도현 전문의',
    title: '10년 차 대학병원 권역외상센터 전문의',
    icon: '🩺',
    themeColor: '#059669',
    gradient: 'from-teal-500 to-emerald-600',
    bgBadge: 'bg-teal-50 text-teal-700 border-teal-200',
    description: '1초를 다투는 응급 환자의 골든타임을 지키며 생명을 되살리는 헌신적인 의사',
    motto: '"단 1초의 골든타임도 헛되이 보내지 않는다."',
    keySkills: ['냉철한 위기 대응력', '환자에 대한 깊은 온기', '방대한 의학 지식과 기술'],
    starterQuestions: [
      '의사로서 일하면서 가장 보람을 느끼거나 눈물 났던 환자가 있나요?',
      '공부를 엄청나게 많이 해야 한다는데, 학창 시절 슬럼프는 어떻게 극복하셨나요?',
      '의사가 되기 위해 마음가짐에서 가장 중요하게 갖춰야 할 것은 무엇인가요?',
    ],
  },
];

export interface HiddenMission {
  id: string;
  text: string;
  badge: string;
  reward: number;
  requiredKeywords: string[];
  hintKeywords: string;
}

export const HIDDEN_MISSIONS: HiddenMission[] = [
  {
    id: 'm1',
    text: "전문가에게 '이 일을 하면서 가장 가슴 벅찼던 순간'을 질문해보세요!",
    badge: '감동의 순간 포착',
    reward: 15,
    requiredKeywords: ['보람', '벅찬', '가슴', '뿌듯', '행복했', '기억에 남는', '자랑스러', '감동', '잊지 못할'],
    hintKeywords: '보람, 가슴 벅찬, 뿌듯, 자랑스러운 순간',
  },
  {
    id: 'm2',
    text: "전문가에게 '초등학생 시절엔 어떤 어린이였는지' 질문해보세요!",
    badge: '어린 시절 타임머신',
    reward: 15,
    requiredKeywords: ['초등학생', '어릴 때', '어렸을 때', '어린 시절', '과거', '어린이', '학창', '어릴적', '꿈이었'],
    hintKeywords: '초등학생 때, 어릴 적, 어린 시절, 꿈',
  },
  {
    id: 'm3',
    text: "전문가에게 '이 직업을 갖기 위해 지금 기르면 좋은 습관'을 물어보세요!",
    badge: '미래 준비 마스터',
    reward: 15,
    requiredKeywords: ['습관', '기르면', '지금부터', '준비', '연습', '배워두', '도움되는', '훈련', '자질'],
    hintKeywords: '습관, 지금부터 기를 것, 준비할 점',
  },
  {
    id: 'm4',
    text: "전문가에게 '일하면서 겪은 가장 힘든 슬럼프와 극복 비결'을 물어보세요!",
    badge: '위기 극복의 지혜',
    reward: 15,
    requiredKeywords: ['슬럼프', '극복', '힘든', '위기', '포기', '어려웠', '이겨냈', '지칠 때', '괴로'],
    hintKeywords: '슬럼프, 극복 비결, 힘들었던 순간',
  },
  {
    id: 'm5',
    text: "전문가에게 '하루 일과와 업무 루틴이 어떻게 되는지' 질문해보세요!",
    badge: '현장 루틴 탐험가',
    reward: 15,
    requiredKeywords: ['일과', '루틴', '출근', '퇴근', '하루', '스케줄', '일과표', '업무 과정', '아침'],
    hintKeywords: '하루 일과, 루틴, 출퇴근, 스케줄',
  },
  {
    id: 'm6',
    text: "전문가에게 '이 직업의 최고 매력과 현실적 고충 솔직 토크'를 요청해보세요!",
    badge: '현실 조언 획득',
    reward: 15,
    requiredKeywords: ['매력', '고충', '장단점', '현실', '장점', '단점', '힘든 점', '솔직', '단점'],
    hintKeywords: '매력, 고충, 솔직한 장단점',
  },
];

/**
 * Checks if the student's question contains at least one required keyword for the mission.
 * Prevents greetings or irrelevant messages from accidentally triggering mission success!
 */
export function verifyMissionKeywords(userQuestion: string, mission: HiddenMission): boolean {
  if (!userQuestion || !mission || !mission.requiredKeywords) return false;
  const clean = userQuestion.toLowerCase().replace(/\s+/g, '');
  return mission.requiredKeywords.some((kw) => clean.includes(kw.toLowerCase().replace(/\s+/g, '')));
}

export function getCustomCareerProfile(customJobName: string): CareerProfile {
  return {
    id: 'custom_' + Date.now(),
    name: customJobName,
    mentorName: `${customJobName} 멘토`,
    title: `10년 차 베테랑 현직 ${customJobName}`,
    icon: '✨',
    themeColor: '#4f46e5',
    gradient: 'from-indigo-600 to-violet-700',
    bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: `현장에서 10년 동안 쌓은 진짜 경험과 노하우를 학생에게 전해주는 ${customJobName} 전문가`,
    motto: `"진짜 좋아하는 일을 향해 한 걸음씩 나아가렴!"`,
    keySkills: ['직업적 전문성', '문제 해결 능력', '일에 대한 깊은 애착'],
    starterQuestions: [
      `${customJobName} 일을 시작하게 된 특별한 계기가 있으셨나요?`,
      `이 일을 하면서 가장 자랑스러웠던 순간은 언제인가요?`,
      `초등학생 때 미리 배워두거나 경험해두면 좋은 것이 있을까요?`,
    ],
  };
}
