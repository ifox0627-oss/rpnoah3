import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Helper to get Gemini client
function getGenAIClient(customKey?: string) {
  const apiKey = (customKey && customKey.trim()) || process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({ apiKey });
}

// Helper to execute with quick timeout and model fallback
// Primary endpoint requested: https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}
async function executeWithRetry<T>(fn: (modelName: string) => Promise<T>, maxRetries = 2): Promise<T> {
  const models = ['gemini-3.5-flash-lite', 'gemini-flash-latest'];
  let attempt = 0;

  for (const model of models) {
    try {
      attempt++;
      // Wrap call in 7.5s timeout so requests never hang indefinitely
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 7500);
      });
      return await Promise.race([fn(model), timeoutPromise]);
    } catch (err: any) {
      const isTemporary =
        err?.message === 'REQUEST_TIMEOUT' ||
        err?.status === 429 ||
        err?.status === 503 ||
        err?.message?.includes('429') ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('UNAVAILABLE');

      if (isTemporary && attempt < models.length) {
        console.warn(`[Gemini API] Quick fallback from ${model} to next model...`);
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }
      throw err;
    }
  }
  throw new Error('All model attempts exhausted');
}

// 1. Check API Key Status
app.get('/api/status', (req, res) => {
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    hasServerKey,
    model: 'gemini-3.5-flash-lite',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
  });
});

// 2. Chat interview endpoint
app.post('/api/interview/chat', async (req, res) => {
  try {
    const { job, messages, currentMission, missionKeywords, studentName, teacherApiKey } = req.body;

    if (!job || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '필수 요청 파라미터가 누락되었습니다.' });
    }

    const ai = getGenAIClient(teacherApiKey);

    // Extract student's most recent message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    const cleanLastUserMsg = lastUserMsg.toLowerCase().replace(/\s+/g, '');

    // Check if the student's question includes at least one keyword required for the mission
    const hasMissionKeyword = Array.isArray(missionKeywords) && missionKeywords.length > 0
      ? missionKeywords.some((kw: string) => cleanLastUserMsg.includes(kw.toLowerCase().replace(/\s+/g, '')))
      : false;

    const systemInstruction = `너는 초등학교/청소년 학생들을 위한 진로 탐색 시뮬레이션 게임의 10년 차 현직 [${job}] 베테랑 전문가야.
학생 이름: ${studentName || '학생 탐험가'}
현재 목표 미션: "${currentMission || '전문가와 의미 있는 질문 주고받기'}"

[답변 가이드라인]
1. 초등학생/중학생 눈높이에 맞춰 다정하고 생생하게, 실제 10년 동안 현장에서 겪은 보람과 땀방울이 느껴지는 실감 나는 이야기로 답변해줘.
2. 기계적인 칭찬("좋은 질문이네요")보다는 학생의 호기심에 진심으로 화답하는 현장 에피소드 중심의 2~4문장 구어체로 답해.
3. 질문의 정성과 진지함에 따라 호감도 점수(affinityChange)를 -5에서 +12 사이로 책정해줘 (진지하고 창의적인 질문일수록 높은 점수).
4. [미션 판정 엄격 규칙 - 절대 주의]:
   - 학생이 단순히 인사말("안녕", "안녕하세요", "반가워", "누구세요", "하이" 등)만 건네거나, 미션 목표와 무관한 일상 대화를 했을 때는 절대로 미션 성공으로 인정하지 마(반드시 missionSuccess: false).
   - 오직 학생이 [목표 미션]의 핵심 주제와 관련된 구체적 질문을 직접 성의 있게 물어보았을 때만 missionSuccess를 true로 설정해야 해.
5. 분위기(mood)를 5가지 중 하나로 골라줘: 'happy'(기쁨/친절), 'proud'(자부심/열정), 'thinking'(신중/전문성), 'touched'(감동/공감), 'sparkle'(신남).

반드시 아래 JSON 형식으로만 응답해 (마크다운 코드블록 없이 순수 JSON):
{
  "dialogue": "다정하고 생생한 2~4문장 구어체 답변",
  "affinityChange": 8,
  "mood": "proud",
  "missionSuccess": false,
  "missionComment": "",
  "tip": "다음으로 질문해볼 만한 흥미로운 진로 힌트"
}`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const result = await executeWithRetry(async (modelName) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
      return response;
    });

    const rawText = result.text || '';
    let parsedData: any = null;

    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch {
      // Fallback parse if JSON is malformed
      parsedData = {
        dialogue: rawText.replace(/```json/gi, '').replace(/```/g, '').trim(),
        affinityChange: 5,
        mood: 'happy',
        missionSuccess: false,
        missionComment: '',
        tip: '전문가님의 하루 일과나 특별했던 경험을 더 물어보세요!',
      };
    }

    // Double safeguard: if user question does NOT contain any required mission keywords, force missionSuccess to false
    const finalMissionSuccess = Boolean(parsedData.missionSuccess) && hasMissionKeyword;

    res.json({
      dialogue: parsedData.dialogue || '질문해줘서 고마워! 더 궁금한 점이 있다면 편하게 물어보렴.',
      affinityChange: typeof parsedData.affinityChange === 'number' ? parsedData.affinityChange : 5,
      mood: parsedData.mood || 'happy',
      missionSuccess: finalMissionSuccess,
      missionComment: finalMissionSuccess ? (parsedData.missionComment || '') : '',
      tip: parsedData.tip || '',
    });
  } catch (error: any) {
    console.error('Error in /api/interview/chat:', error);
    if (error.message === 'MISSING_API_KEY') {
      return res.status(401).json({
        error: 'API 키가 설정되지 않았습니다. 관리자 또는 교사용 키를 입력해주세요.',
      });
    }
    if (error.status === 429) {
      return res.status(429).json({
        error: '구글 서버 사용량이 일시적으로 많습니다. 자동 재시도 중입니다.',
      });
    }
    res.status(500).json({
      error: '전문가와 대화 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      details: error.message,
    });
  }
});

// 3. Final evaluation endpoint - FIXES the raw code block / JSON dump bug!
app.post('/api/interview/finish', async (req, res) => {
  try {
    const { job, messages, affinity, missionCompleted, studentName, teacherApiKey } = req.body;

    if (!job) {
      return res.status(400).json({ error: '직업 정보가 누락되었습니다.' });
    }

    const ai = getGenAIClient(teacherApiKey);

    const finishPrompt = `너는 10년 차 [${job}] 베테랑 현직 전문가로서, 면담을 마친 초등학생/청소년 [${studentName || '학생 탐험가'}]에게 '진로 탐험 공인 인터뷰 리포트'를 발행하는 멘토야.
- 최종 친밀도 점수: ${affinity || 50}점 / 100점
- 히든 미션 달성 여부: ${missionCompleted ? '성공' : '미달성'}

[작성 지침]
지금까지의 대화 기록을 분석해서 학생에게 자긍심과 진로에 대한 꿈을 심어주는 감동적인 맞춤형 피드백을 작성해줘.
절대로 코드나 복잡한 기호를 쓰지 마. 반드시 아래 JSON 규격에 맞춰 응답해:
{
  "title": "호감도 점수에 맞는 명예 칭호 (예: 전설의 직업 마스터 / 열정의 특파원 / 빛나는 미래 탐험가)",
  "grade": "S 또는 A 또는 B+",
  "overallEvaluation": "학생의 인상 깊었던 질문 태도와 호기심을 칭찬하는 다정한 총평 (2~3문장)",
  "veteranAdvice": "10년 차 ${job} 전문가로서 전하는 현실적인 조언과 이 일의 진짜 보람 (2~3문장)",
  "habitsToGrow": [
    "초등학생 때 지금부터 길러두면 큰 힘이 되는 구체적인 습관 1",
    "초등학생 때 길러두면 큰 힘이 되는 구체적인 습관 2"
  ],
  "cheeringMessage": "학생의 빛나는 미래를 향한 따뜻하고 힘찬 응원 메시지 (2문장)",
  "mentorSignature": "10년 차 ${job} 멘토 드림"
}`;

    const historySummary = (messages || [])
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? '학생' : '전문가'}: ${m.content}`)
      .join('\n');

    const promptText = `[지금까지의 면담 대화 기록]
${historySummary || '(면담 시작됨)'}

${finishPrompt}`;

    const result = await executeWithRetry(async (modelName) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });
      return response;
    });

    const rawText = result.text || '';
    let parsedReport: any = null;

    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedReport = JSON.parse(cleanJson);
    } catch {
      // Robust fallback if JSON parsing failed
      parsedReport = {
        title: affinity >= 80 ? '전설의 직업 인터뷰 마스터 🏆' : '열정의 진로 탐험가 ⭐',
        grade: affinity >= 85 ? 'S' : affinity >= 70 ? 'A' : 'B+',
        overallEvaluation: `${job}에 대해 진지하고 깊이 있는 질문을 던져주어 정말 인상 깊었습니다. 적극적으로 탐구하는 모습이 매우 훌륭했습니다.`,
        veteranAdvice: `10년 동안 ${job} 일을 하면서 힘든 날도 많았지만, 나의 일로 누군가에게 도움이 되고 보람을 느낄 때 가장 행복했습니다.`,
        habitsToGrow: [
          '매일 꾸준히 관심 분야의 책과 영상을 찾아보며 기록하는 습관',
          '새로운 문제에 부딪혀도 포기하지 않고 호기심을 잃지 않는 마음가짐',
        ],
        cheeringMessage: `오늘 보여준 반짝이는 호기심이라면 어떤 꿈이든 멋지게 이뤄낼 수 있을 거예요! 진심으로 응원합니다.`,
        mentorSignature: `10년 차 ${job} 전문가 드림`,
      };
    }

    res.json(parsedReport);
  } catch (error: any) {
    console.error('Error in /api/interview/finish:', error);
    if (error.message === 'MISSING_API_KEY') {
      return res.status(401).json({
        error: 'API 키가 설정되지 않았습니다.',
      });
    }
    // Return a graceful structured report even on error so user never gets broken screen
    res.json({
      title: '영예의 진로 탐험가 🎖️',
      grade: 'A',
      overallEvaluation: `${req.body.job || '전문가'}님과의 값진 대화를 통해 훌륭한 질문들을 많이 던져주었습니다. 질문 하나하나에 진심 어린 호기심이 가득했습니다.`,
      veteranAdvice: `어떤 직업이든 가장 중요한 것은 자신이 좋아하는 일에 대한 열정과 꾸준함입니다. 10년의 시간 동안 현장에서 가장 크게 배운 점입니다.`,
      habitsToGrow: [
        '자신의 생각을 명확하고 예의 바르게 표현하는 연습',
        '주변의 작은 일에도 호기심을 갖고 깊이 관찰하는 습관',
      ],
      cheeringMessage: `오늘의 인터뷰 경험이 멋진 미래를 열어가는 든든한 디딤돌이 되길 응원합니다!`,
      mentorSignature: `10년 차 ${req.body.job || '현직 전문가'} 드림`,
    });
  }
});

// Vite integration
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dream Quest Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
