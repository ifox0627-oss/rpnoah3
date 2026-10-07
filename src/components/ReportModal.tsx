import React, { useRef } from 'react';
import {
  Award,
  CheckCircle2,
  Share2,
  Printer,
  RotateCcw,
  Sparkles,
  BookOpen,
  Compass,
  Heart,
  Quote,
  Flame,
} from 'lucide-react';
import { sound } from '../utils/sound';

export interface FinalReportData {
  title: string;
  grade: string;
  overallEvaluation: string;
  veteranAdvice: string;
  habitsToGrow: string[];
  cheeringMessage: string;
  mentorSignature?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FinalReportData | null;
  jobName: string;
  mentorName: string;
  studentName: string;
  affinity: number;
  missionCompleted: boolean;
  questionCount: number;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  report,
  jobName,
  mentorName,
  studentName,
  affinity,
  missionCompleted,
  questionCount,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    sound.play('click');
    window.print();
  };

  const handleCopySummary = () => {
    sound.play('click');
    const textToCopy = `[드림 퀘스트 진로 탐험 인증서]
- 탐험가: ${studentName || '학생 탐험가'}
- 만난 전문가: 10년 차 ${jobName} (${mentorName})
- 최종 호감도: ${affinity}점 / 등급: ${report.grade}급
- 히든 미션: ${missionCompleted ? '달성 성공 🎉' : '진행 완료'}
- 획득 칭호: ${report.title}

[전문가 총평]
${report.overallEvaluation}

[현직자의 현실 조언]
${report.veteranAdvice}

[추천 습관]
${report.habitsToGrow.map((h, i) => `${i + 1}. ${h}`).join('\n')}

[응원 메시지]
${report.cheeringMessage}
- ${report.mentorSignature || `10년 차 ${jobName} 멘토`}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const gradeColors: Record<string, string> = {
    S: 'from-amber-400 to-yellow-500 text-amber-950 border-amber-300',
    A: 'from-indigo-400 to-purple-500 text-white border-purple-300',
    'B+': 'from-blue-400 to-cyan-500 text-white border-blue-300',
  };

  const currentGradeColor = gradeColors[report.grade] || gradeColors['A'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border-4 border-amber-200/80 overflow-hidden my-auto">
        {/* Certificate Top Header Decoration */}
        <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white px-6 py-6 text-center overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-36 h-36 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Ribbon Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 shadow-lg shadow-amber-500/30 border-2 border-white/60 mb-2">
            <Award className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Jua'] text-amber-200 drop-shadow">
            진로 탐험 공인 인터뷰 리포트
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium mt-1">
            10년 차 현직 전문가와의 진솔한 대화를 성공적으로 수료하였습니다.
          </p>

          {/* Title Badge Tag */}
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-amber-100 font-bold text-sm tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{report.title}</span>
            <span className="bg-amber-400 text-amber-950 text-xs px-2 py-0.5 rounded-full font-black">
              RANK {report.grade}
            </span>
          </div>
        </div>

        {/* Scrollable Certificate Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-slate-50/70">
          {/* Student & Mentor Stat Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 block">탐험가</span>
              <span className="text-sm sm:text-base font-bold text-slate-800 truncate block mt-0.5">
                {studentName || '빛나는 학생'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 block">만난 전문가</span>
              <span className="text-sm sm:text-base font-bold text-indigo-700 truncate block mt-0.5">
                10년차 {jobName}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 block">최종 친밀도</span>
              <span className="text-sm sm:text-base font-bold text-rose-600 flex items-center justify-center gap-1 mt-0.5 font-['Jua']">
                <Heart className="w-4 h-4 fill-rose-500" />
                {affinity}점
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 block">히든 미션</span>
              <span className="text-sm sm:text-base font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                {missionCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>달성 성공!</span>
                  </>
                ) : (
                  <span className="text-slate-400">완료</span>
                )}
              </span>
            </div>
          </div>

          {/* Section 1: Overall Assessment */}
          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>전문가 종합 총평</span>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line pl-1 border-l-2 border-indigo-300">
              {report.overallEvaluation}
            </p>
          </div>

          {/* Section 2: Real Veteran Advice */}
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <Compass className="w-4 h-4" />
              <span>10년 차 현직자의 생생한 현실 조언</span>
            </div>
            <div className="relative bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 text-slate-700 text-sm sm:text-base leading-relaxed">
              <Quote className="w-6 h-6 text-amber-400/50 absolute top-2 right-2" />
              <p className="relative z-10 italic">{report.veteranAdvice}</p>
            </div>
          </div>

          {/* Section 3: Recommended Habits */}
          {report.habitsToGrow && report.habitsToGrow.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Flame className="w-4 h-4 text-emerald-600" />
                <span>지금 초등학생 때 길러두면 큰 힘이 되는 습관</span>
              </div>
              <ul className="space-y-2">
                {report.habitsToGrow.map((habit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{habit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 4: Cheering Message */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-200 shadow-sm text-center space-y-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest block">
              멘토의 감동 응원장
            </span>
            <p className="text-sm sm:text-base text-purple-950 font-medium leading-relaxed">
              "{report.cheeringMessage}"
            </p>
            <div className="pt-2 text-xs font-bold text-slate-500 tracking-wider">
              {report.mentorSignature || `10년 차 ${jobName} 멘토 드림`}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>증서 인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>{copied ? '복사 완료! 👍' : '텍스트 복사'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              sound.play('click');
              onClose();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all transform active:scale-95 font-['Jua']"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다른 직업 전문가 만나러 가기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
