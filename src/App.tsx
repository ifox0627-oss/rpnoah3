/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Send,
  Flag,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Search,
  KeyRound,
  Settings,
  ChevronRight,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react';
import {
  CAREER_PROFILES,
  HIDDEN_MISSIONS,
  getCustomCareerProfile,
  CareerProfile,
  HiddenMission,
  verifyMissionKeywords,
} from './data/careerData';
import { MentorAvatar } from './components/MentorAvatar';
import { Confetti } from './components/Confetti';
import { ReportModal, FinalReportData } from './components/ReportModal';
import { sound } from './utils/sound';

interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  speakerName: string;
  avatarIcon?: string;
  affinityChange?: number;
  mood?: 'happy' | 'proud' | 'thinking' | 'touched' | 'sparkle';
  isMissionSuccess?: boolean;
}

export default function App() {
  // Game screens: 'select' | 'interview' | 'finished'
  const [gameState, setGameState] = useState<'select' | 'interview'>('select');

  // Sound
  const [isSoundOn, setIsSoundOn] = useState(sound.enabled);

  // Student Profile
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('dreamquest_student_name') || '';
  });

  // Selected Career Profile
  const [selectedProfile, setSelectedProfile] = useState<CareerProfile>(CAREER_PROFILES[0]);
  const [customJobText, setCustomJobText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Teacher / Server settings
  const [teacherApiKey, setTeacherApiKey] = useState(() => {
    return localStorage.getItem('dreamquest_teacher_key') || '';
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [serverKeyAvailable, setServerKeyAvailable] = useState(true);

  // In-Game state
  const [affinity, setAffinity] = useState(50);
  const [currentMission, setCurrentMission] = useState<HiddenMission>(HIDDEN_MISSIONS[0]);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryNotice, setRetryNotice] = useState<string | null>(null);
  const [floatingScore, setFloatingScore] = useState<{ diff: number; key: number } | null>(null);
  const [showHelperQuestions, setShowHelperQuestions] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [mentorMood, setMentorMood] = useState<'happy' | 'proud' | 'thinking' | 'touched' | 'sparkle'>('happy');
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [timeoutSecondsLeft, setTimeoutSecondsLeft] = useState<number>(8);

  // Final Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [finalReport, setFinalReport] = useState<FinalReportData | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<any>(null);

  // Cancel in-flight question and immediately unlock input
  const cancelCurrentRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsLoading(false);
    setRetryNotice(null);
    sound.play('click');
    setMessages((prev) => [
      ...prev,
      {
        id: 'cancel_' + Date.now(),
        role: 'system',
        speakerName: '알림',
        content: '⏹️ 질문 대기가 취소되었습니다. 다시 질문을 입력하실 수 있습니다.',
      },
    ]);
  };

  // Check server status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setServerKeyAvailable(data.hasServerKey);
      })
      .catch(() => {
        setServerKeyAvailable(false);
      });
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, retryNotice]);

  const handleToggleSound = () => {
    const updated = sound.toggle();
    setIsSoundOn(updated);
  };

  const handleSaveStudentName = (name: string) => {
    setStudentName(name);
    localStorage.setItem('dreamquest_student_name', name);
  };

  const handleSaveTeacherKey = (key: string) => {
    setTeacherApiKey(key);
    localStorage.setItem('dreamquest_teacher_key', key);
  };

  // Start interview quest
  const handleStartInterview = (profileToUse: CareerProfile) => {
    sound.play('click');
    setSelectedProfile(profileToUse);

    // Randomize mission
    const randomMission = HIDDEN_MISSIONS[Math.floor(Math.random() * HIDDEN_MISSIONS.length)];
    setCurrentMission(randomMission);
    setMissionCompleted(false);
    setAffinity(50);
    setMentorMood('happy');

    // Welcome greeting
    const welcomeMsg: ChatMessage = {
      id: 'welcome_' + Date.now(),
      role: 'model',
      speakerName: profileToUse.mentorName,
      avatarIcon: profileToUse.icon,
      content: `반가워! ${studentName ? studentName + ' 학생' : '친구'}! 10년 동안 **${profileToUse.name}** 현장에서 일하면서 겪은 진짜 이야기를 들려줄게. 평소에 어떤 점이 가장 궁금했니? 편하게 물어보렴!`,
      mood: 'happy',
    };

    const missionSystemNotice: ChatMessage = {
      id: 'system_mission_' + Date.now(),
      role: 'system',
      speakerName: '진로 탐험 시스템',
      content: `🎯 오늘의 히든 미션: "${randomMission.text}" 질문을 성공하면 특별 보너스 호감도와 뱃지를 획득합니다!`,
    };

    setMessages([welcomeMsg, missionSystemNotice]);
    setGameState('interview');
    sound.play('receive');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  // Send message with responsive 8-second timeout & strict keyword verification
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    sound.play('send');
    setInputValue('');
    setLastQuestion(text);
    setShowHelperQuestions(false);

    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add user message to UI
    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      speakerName: studentName || '나 (탐험가)',
      avatarIcon: '🎒',
      content: text,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);
    setRetryNotice(null);

    // Start 8-second countdown
    let secondsLeft = 8;
    setTimeoutSecondsLeft(secondsLeft);
    timerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setTimeoutSecondsLeft(secondsLeft);
      if (secondsLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        controller.abort();
      }
    }, 1000);

    // Filter messages for backend history
    const apiMessages = newHistory
      .filter((m) => m.role === 'user' || m.role === 'model')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          job: selectedProfile.name,
          messages: apiMessages,
          currentMission: currentMission.text,
          missionKeywords: currentMission.requiredKeywords,
          studentName: studentName || '학생',
          teacherApiKey: teacherApiKey.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `서버 응답 오류 (${response.status})`);
      }

      const data = await response.json();
      setRetryNotice(null);

      // Update affinity
      const diff = data.affinityChange || 5;
      const newScore = Math.max(0, Math.min(100, affinity + diff));
      setAffinity(newScore);

      // Floating score popup
      setFloatingScore({ diff, key: Date.now() });
      if (diff > 0) {
        sound.play('heartUp');
      } else if (diff < 0) {
        sound.play('heartDown');
      }

      // Mentor mood
      const mood = data.mood || 'proud';
      setMentorMood(mood);

      // Model reply message
      const replyMsg: ChatMessage = {
        id: 'model_' + Date.now(),
        role: 'model',
        speakerName: selectedProfile.mentorName,
        avatarIcon: selectedProfile.icon,
        content: data.dialogue,
        affinityChange: diff,
        mood,
      };

      // Strict Mission Check: Must be verified by BOTH keyword match AND server
      const isKeywordMatched = verifyMissionKeywords(text, currentMission);

      if (!missionCompleted && data.missionSuccess && isKeywordMatched) {
        setMissionCompleted(true);
        setConfettiActive(true);
        sound.play('questSuccess');

        const bonusAffinity = Math.min(100, newScore + currentMission.reward);
        setAffinity(bonusAffinity);

        const questSuccessMsg: ChatMessage = {
          id: 'mission_success_' + Date.now(),
          role: 'system',
          speakerName: '미션 완료!',
          content: `🎉 [히든 미션 달성!] ${data.missionComment || '전문가의 마음을 여는 멋진 질문이었습니다!'} (+${currentMission.reward}점 보너스 획득)`,
          isMissionSuccess: true,
        };

        setMessages((prev) => [...prev, replyMsg, questSuccessMsg]);
      } else {
        setMessages((prev) => [...prev, replyMsg]);
        sound.play('receive');
      }
    } catch (err: any) {
      const isTimeout =
        err.name === 'AbortError' ||
        err.message?.includes('aborted') ||
        err.message?.includes('REQUEST_TIMEOUT');

      if (isTimeout) {
        const timeoutMsg: ChatMessage = {
          id: 'timeout_' + Date.now(),
          role: 'system',
          speakerName: '알림',
          content: `⏳ 전문가님의 응답 대기 시간(8초)이 초과되어 대기가 해제되었습니다. 서버 과부하일 수 있으니 아래 [방금 질문 다시 보내기] 버튼을 누르거나 다른 질문을 입력해 보세요!`,
        };
        setMessages((prev) => [...prev, timeoutMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: 'err_' + Date.now(),
          role: 'system',
          speakerName: '알림',
          content: `⚠️ ${err.message || '전문가와의 연결이 일시적으로 지연되고 있습니다. 잠시 후 다시 질문해 보세요!'}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsLoading(false);
      setRetryNotice(null);
      abortControllerRef.current = null;
    }
  };

  // Finish interview
  const handleFinishInterview = async () => {
    sound.play('click');
    const userConfirm = window.confirm(
      '면담을 마치고 나의 직업 탐구 종합 성적표와 인증서를 확인하시겠습니까?'
    );
    if (!userConfirm) return;

    sound.play('finish');
    setIsLoading(true);
    setRetryNotice('📜 면담이 종료되었습니다. AI 전문가가 리포트 카드를 분석하고 있습니다...');

    const apiMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'model')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const response = await fetch('/api/interview/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(9000),
        body: JSON.stringify({
          job: selectedProfile.name,
          messages: apiMessages,
          affinity,
          missionCompleted,
          studentName: studentName || '학생 탐험가',
          teacherApiKey: teacherApiKey.trim(),
        }),
      });

      const reportData: FinalReportData = await response.json();
      setFinalReport(reportData);
      setConfettiActive(true);
      setReportModalOpen(true);
    } catch {
      // Graceful fallback so student screen never breaks!
      setFinalReport({
        title: affinity >= 80 ? '전설의 인터뷰 마스터 🏆' : '열정의 진로 탐험가 ⭐',
        grade: affinity >= 80 ? 'S' : 'A',
        overallEvaluation: `${selectedProfile.name}에 대해 깊이 고민하고 호기심 어린 질문을 아낌없이 던져주었습니다. 10년 차 현직자로서 학생의 밝은 미래가 무척 기대됩니다.`,
        veteranAdvice: `10년 동안 현장에서 일하며 가장 중요했던 것은 언제나 새로운 것에 도전하는 용기와 실패해도 다시 일어서는 꾸준함이었습니다.`,
        habitsToGrow: [
          '평소 궁금한 직업과 세상의 뉴스에 꾸준히 관심을 갖는 습관',
          '자신의 생각과 질문을 조리 있게 기록하고 정리하는 연습',
        ],
        cheeringMessage: `오늘 보여준 훌륭한 탐구 자세라면 어떤 꿈이든 멋지게 이뤄낼 수 있을 거예요! 항상 응원합니다.`,
        mentorSignature: `10년 차 ${selectedProfile.name} ${selectedProfile.mentorName} 드림`,
      });
      setConfettiActive(true);
      setReportModalOpen(true);
    } finally {
      setIsLoading(false);
      setRetryNotice(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col font-['Noto_Sans_KR',sans-serif] select-none">
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/85 backdrop-blur-md border-b border-indigo-900/50 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-2xl shadow-md shadow-indigo-500/30">
              🎮
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black font-['Jua'] tracking-wide text-white flex items-center gap-2">
                <span>드림 퀘스트</span>
                <span className="text-xs font-normal text-indigo-300 hidden sm:inline">
                  AI 직업 전문가 면담 어드벤처
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Server key badge indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-xs text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{serverKeyAvailable || teacherApiKey ? '학교/선생님 키 연결 완료' : '키 설정 가능'}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              title={isSoundOn ? '소리 끄기' : '소리 켜기'}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Teacher settings button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              title="교사용 설정 / API 키 확인"
            >
              <Settings className="w-4 h-4 text-indigo-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        {gameState === 'select' ? (
          /* =========================================================
             STAGE 1: CAREER SELECTION & STUDENT PREPARATION
             ========================================================= */
          <div className="space-y-6 my-auto py-4">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>초·중등 진로 탐험 퀘스트</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold font-['Jua'] text-white leading-tight">
                  10년 차 현직 전문가와 <br />
                  생생한 1:1 진로 인터뷰를 떠나보세요!
                </h2>
                <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  평소 궁금했던 직업의 베테랑 멘토에게 예의 바르게 질문하고, 호감도를 쌓아 오늘의{' '}
                  <strong className="text-amber-300">히든 미션</strong>을 달성해 보세요!
                </p>

                {/* Student Name Input */}
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => handleSaveStudentName(e.target.value)}
                      placeholder="내 이름 / 별명 입력 (예: 김하늘)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-indigo-400/30 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <span className="text-xs text-indigo-300 font-medium">
                    (이름을 입력하면 최종 인증서에 멋지게 인쇄됩니다!)
                  </span>
                </div>
              </div>
            </div>

            {/* Career Presets Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-bold font-['Jua'] text-white flex items-center gap-2">
                  <span>💼 만나고 싶은 전문가 선택</span>
                  <span className="text-xs font-normal text-indigo-300">클릭하면 즉시 면담이 시작됩니다</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {CAREER_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleStartInterview(profile)}
                    className="group relative flex flex-col items-center p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-400 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl text-center active:scale-95"
                  >
                    <MentorAvatar icon={profile.icon} themeColor={profile.themeColor} size="md" />

                    <div className="mt-3">
                      <span className="block text-base font-bold font-['Jua'] text-white group-hover:text-indigo-200 transition-colors">
                        {profile.name}
                      </span>
                      <span className="block text-xs text-slate-400 font-medium truncate max-w-[130px] mt-0.5">
                        {profile.mentorName}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-indigo-300/80 line-clamp-1 italic">
                      {profile.motto}
                    </div>

                    <div className="mt-3 w-full py-1.5 px-3 rounded-xl bg-indigo-900/40 group-hover:bg-indigo-600 text-indigo-200 group-hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 font-['Jua']">
                      <span>면담 시작</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Job Input Section */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-indigo-900/60 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-['Jua'] text-white">
                  목록에 없는 특별한 직업을 직접 소환하기!
                </h3>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                예: 로봇 공학자, 고고학자, 뮤지컬 배우, 항공기 조종사, 변호사, 사육사 등
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customJobText.trim()) return;
                  const profile = getCustomCareerProfile(customJobText.trim());
                  handleStartInterview(profile);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={customJobText}
                  onChange={(e) => setCustomJobText(e.target.value)}
                  placeholder="만나고 싶은 직업을 직접 적어보세요..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!customJobText.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold font-['Jua'] text-sm transition-all shadow-md active:scale-95 flex items-center gap-1"
                >
                  <span>전문가 소환</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* =========================================================
             STAGE 2: IN-GAME INTERVIEW SIMULATION
             ========================================================= */
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Top Status & Affinity Board */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/90 border border-indigo-900/60 shadow-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* NPC Info */}
              <div className="flex items-center gap-3">
                <MentorAvatar
                  icon={selectedProfile.icon}
                  themeColor={selectedProfile.themeColor}
                  mood={mentorMood}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black font-['Jua'] text-white">
                      {selectedProfile.mentorName}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      10년차 {selectedProfile.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-1 max-w-sm mt-0.5">
                    {selectedProfile.motto}
                  </p>
                </div>
              </div>

              {/* Affinity Gauge & Floating Score */}
              <div className="relative flex-1 sm:max-w-xs flex flex-col justify-center gap-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>호감도 게이지</span>
                  </span>
                  <span className="text-rose-400 font-['Jua'] text-sm tracking-wide">
                    {affinity}점 / 100점
                  </span>
                </div>

                {/* Gauge bar track */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${affinity}%` }}
                  />
                </div>

                {/* Floating score text */}
                {floatingScore && (
                  <span
                    key={floatingScore.key}
                    className="absolute -top-4 right-2 text-sm font-black font-['Jua'] animate-bounce drop-shadow"
                    style={{
                      color: floatingScore.diff > 0 ? '#fb7185' : '#94a3b8',
                    }}
                  >
                    {floatingScore.diff > 0 ? `+${floatingScore.diff} ❤️` : `${floatingScore.diff} 💔`}
                  </span>
                )}
              </div>
            </div>

            {/* Hidden Mission HUD Banner */}
            <div
              className={`p-3 rounded-2xl flex flex-col gap-2 border transition-all ${
                missionCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex-shrink-0 text-xl">
                    {missionCompleted ? '🏆' : '🎯'}
                  </span>
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider font-bold block opacity-80">
                      {missionCompleted ? '히든 미션 클리어!' : '오늘의 히든 퀘스트'}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold truncate">
                      {currentMission.text}
                    </p>
                  </div>
                </div>

                <span
                  className={`flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-full ${
                    missionCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {missionCompleted ? '성공 ✨ (+15점)' : '도전 과제'}
                </span>
              </div>

              {!missionCompleted && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium bg-amber-900/30 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>필수 단어 힌트:</strong> 질문에 <span className="underline font-bold text-amber-200">[{currentMission.hintKeywords}]</span> 관련 단어가 들어가야 미션이 완료됩니다! (단순 인사는 제외)
                  </span>
                </div>
              )}
            </div>

            {/* Chat Messages Viewport */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 rounded-3xl bg-slate-900/80 border border-indigo-900/50 shadow-inner flex flex-col gap-3.5 scroll-smooth"
              style={{ minHeight: '320px', maxHeight: '50vh' }}
            >
              {messages.map((msg) => {
                if (msg.role === 'system') {
                  return (
                    <div
                      key={msg.id}
                      className={`self-center max-w-lg text-center px-4 py-2 rounded-2xl text-xs font-semibold border ${
                        msg.isMissionSuccess
                          ? 'bg-emerald-900/50 text-emerald-200 border-emerald-500/60 shadow-lg'
                          : 'bg-slate-800/80 text-indigo-300 border-indigo-800/50'
                      }`}
                    >
                      {msg.content}
                    </div>
                  );
                }

                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[78%] ${
                      isUser ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base shadow">
                      {msg.avatarIcon || (isUser ? '🎒' : selectedProfile.icon)}
                    </div>

                    <div className="flex flex-col">
                      <span
                        className={`text-[11px] font-bold text-slate-400 mb-1 px-1 ${
                          isUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {msg.speakerName}
                      </span>
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-md ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Waiting & Retry typing indicator */}
              {isLoading && (
                <div className="self-start flex items-end gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base">
                    {selectedProfile.icon}
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-bl-none flex flex-col gap-1.5 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-pink-400" />
                      </div>
                      <span className="text-xs text-indigo-300 font-medium">
                        {selectedProfile.mentorName}님이 답변 중입니다... ({timeoutSecondsLeft}초 후 자동 해제)
                      </span>
                      <button
                        type="button"
                        onClick={cancelCurrentRequest}
                        className="ml-1 px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-400/30 transition-colors"
                        title="기다리지 않고 대기 취소"
                      >
                        대기 취소
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Starter Question Suggestions Helper */}
            {showHelperQuestions && (
              <div className="p-3 rounded-2xl bg-slate-800 border border-indigo-500/40 shadow-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-300 px-1">
                  <span className="flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>추천 질문 골라보기 (클릭하면 바로 질문합니다)</span>
                  </span>
                  <button
                    onClick={() => setShowHelperQuestions(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    닫기
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {selectedProfile.starterQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left p-2.5 rounded-xl bg-slate-900/70 hover:bg-indigo-900/50 border border-slate-700 hover:border-indigo-400 text-xs sm:text-sm text-slate-200 hover:text-white transition-colors"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Input & Action Bar */}
            <div className="space-y-2">
              {/* Quick Retry Chip for Last Question if pending/failed */}
              {lastQuestion && !isLoading && (
                <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                  <span className="text-slate-400 truncate max-w-[260px] sm:max-w-md">
                    이전 질문: "{lastQuestion}"
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSendMessage(lastQuestion)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs flex items-center gap-1 font-bold transition-all shadow-sm active:scale-95 flex-shrink-0"
                  >
                    <RotateCcw className="w-3 h-3 text-indigo-400" />
                    <span>방금 질문 다시 보내기</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.play('click');
                    setShowHelperQuestions((prev) => !prev);
                  }}
                  className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
                  title="어떤 질문을 할지 막막할 때"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">추천 질문</span>
                </button>

                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        handleSendMessage();
                      }
                    }}
                    placeholder="전문가님께 예의 바르고 궁금한 점을 질문해 보세요..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 focus:border-indigo-400 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold font-['Jua'] text-sm transition-all shadow-md active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>보내기</span>
                  <Send className="w-4 h-4" />
                </button>

                <button
                  onClick={handleFinishInterview}
                  disabled={isLoading}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 text-white font-bold font-['Jua'] text-sm transition-all shadow-md active:scale-95 flex items-center gap-1 flex-shrink-0"
                  title="면담을 마치고 성적표 확인"
                >
                  <span>면담 완료</span>
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Back button */}
              <div className="flex justify-between items-center px-1 text-xs text-slate-400">
                <span>💬 10년 차 전문가와 1:1 대화 중입니다</span>
                <button
                  onClick={() => {
                    sound.play('click');
                    if (window.confirm('다른 직업 선택 화면으로 돌아가시겠습니까?')) {
                      setGameState('select');
                    }
                  }}
                  className="text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>직업 다시 고르기</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Teacher / School Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold font-['Jua']">교사용 환경 설정</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                닫기
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">서버 환경 키 상태</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    gemini-3.5-flash-lite
                  </span>
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {serverKeyAvailable
                      ? 'AI Studio 서버 키가 활성화되어 있습니다 (학생 입력 불필요)'
                      : '서버 키가 미설정 상태입니다 (아래 교사 키 입력 가능)'}
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 font-mono break-all pt-1 border-t border-slate-700/60">
                  엔드포인트: https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent
                </p>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">
                  선생님 전용 Gemini API 키 (선택사항)
                </label>
                <input
                  type="password"
                  value={teacherApiKey}
                  onChange={(e) => handleSaveTeacherKey(e.target.value)}
                  placeholder="AIzaSy... 형식의 키 입력"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-400"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  선생님 키를 저장해두면 모든 학생이 키 입력 없이 바로 면담을 진행할 수 있습니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.play('click');
                setShowSettingsModal(false);
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold font-['Jua'] text-white transition-colors"
            >
              설정 저장 완료
            </button>
          </div>
        </div>
      )}

      {/* Final Report Card Certificate Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setGameState('select');
        }}
        report={finalReport}
        jobName={selectedProfile.name}
        mentorName={selectedProfile.mentorName}
        studentName={studentName}
        affinity={affinity}
        missionCompleted={missionCompleted}
        questionCount={messages.filter((m) => m.role === 'user').length}
      />
    </div>
  );
}
