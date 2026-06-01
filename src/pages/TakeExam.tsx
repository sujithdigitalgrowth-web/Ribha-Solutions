import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { SkillTestResult } from '@/contexts/AuthContext';
import { getProfile, saveProfile, hasFreelancerPassedExam } from '@/utils/profilesStorage';
import { hasCompletedOnboarding } from '@/utils/freelancerOnboardingStorage';
import { SKILL_TESTS } from '@/config/skillTests';
import type { SkillTestConfig } from '@/config/skillTests';
import {
  fetchExamDefinitions,
  submitExamAttempt,
  type ExamDefinition,
} from '@/services/dynamicDataApi';
import { addAttempt } from '@/utils/examAttemptsStorage';

type ExamConfig = ExamDefinition | SkillTestConfig;

export function TakeExam() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const userId = user?.id ?? '';
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [step, setStep] = useState<'skill' | 'exam' | 'result'>('skill');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examQuestionIndex, setExamQuestionIndex] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [result, setResult] = useState<SkillTestResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchExamDefinitions().then((list) => {
      if (!cancelled) {
        setExams(list.length > 0 ? list : (SKILL_TESTS as ExamConfig[]));
      }
    }).finally(() => {
      if (!cancelled) setExamsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const getTest = (skillId: string): ExamConfig | null =>
    exams.find((t) => t.skillId === skillId) ?? null;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: '/take-exam' }, replace: true });
      return;
    }
    if (user.role !== 'freelancer') {
      navigate('/find-talent', { replace: true });
      return;
    }
    if (hasFreelancerPassedExam(user.id) && step !== 'result') {
      navigate(hasCompletedOnboarding(user.id) ? '/dashboard' : '/freelancer-onboarding', { replace: true });
    }
  }, [isAuthenticated, user?.id, user?.role, step, navigate]);

  // While redirecting (or auth not ready), avoid accessing user fields.
  if (!isAuthenticated || !user) return null;

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkillId(skillId);
    setExamAnswers({});
    setExamQuestionIndex(0);
    setExamStarted(false);
    setStep('exam');
  };

  const startExam = () => setExamStarted(true);

  const handleExamAnswer = (questionId: string, optionIndex: number) => {
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitExam = async () => {
    const test = selectedSkillId ? getTest(selectedSkillId) : null;
    if (!test) return;
    const correct = test.questions.filter((q) => examAnswers[q.id] === q.correctIndex).length;
    const score = Math.round((correct / test.questions.length) * 100);
    const passed = score >= test.passingScore;
    const passedAt = new Date().toISOString();
    const res: SkillTestResult = {
      skillId: test.skillId,
      skillName: test.skillName,
      score,
      passed,
      passedAt,
    };
    setResult(res);
    setStep('result');

    const attempt = {
      userId,
      skillId: test.skillId,
      skillName: test.skillName,
      score,
      passed,
      passedAt,
    };
    await submitExamAttempt(attempt);
    addAttempt(userId, attempt);

    if (passed) {
      const profile = getProfile(userId);
      const existingBadges = profile?.skillBadges ?? [];
      const base = profile ?? {
        userId,
        title: 'Freelancer',
        bio: '',
        hourlyRate: 'To be discussed',
        skills: [] as string[],
        availability: '',
        experience: 'intermediate',
      };
      saveProfile({
        ...base,
        skillBadges: [...existingBadges, res],
        title: profile?.title || `${res.skillName} Professional`,
        skills: profile?.skills?.length ? profile.skills : [res.skillName],
      });
    }
  };

  const handleExamNext = () => {
    const test = selectedSkillId ? getTest(selectedSkillId) : null;
    if (!test) return;
    if (examQuestionIndex < test.questions.length - 1) {
      setExamQuestionIndex((i) => i + 1);
    } else {
      void submitExam();
    }
  };

  const test = selectedSkillId ? getTest(selectedSkillId) : null;
  const currentQuestion = test?.questions[examQuestionIndex];
  const isLastQuestion = test && examQuestionIndex === test.questions.length - 1;
  const canProceedExam = currentQuestion && examAnswers[currentQuestion.id] !== undefined;

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg">
        {step === 'skill' && (
          <>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Skill exam required</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Pass a skill test to access your dashboard and find work. You need 70% to pass.
            </p>
            {examsLoading ? (
              <p className="text-slate-500 dark:text-slate-400">Loading exams…</p>
            ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {exams.map((t) => (
                <button
                  key={t.skillId}
                  type="button"
                  onClick={() => handleSkillSelect(t.skillId)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 bg-white dark:bg-slate-800 text-left transition-colors"
                >
                  <span className="text-2xl block mb-1">{t.icon}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{t.skillName}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.questions.length} questions • {t.timeLimitMinutes} min</p>
                </button>
              ))}
            </div>
            )}
          </>
        )}

        {step === 'exam' && test && (
          <>
            <button type="button" onClick={() => { setStep('skill'); setSelectedSkillId(null); }} className="text-slate-500 hover:text-indigo-600 mb-4 text-sm">
              ← Change skill
            </button>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{test.icon} {test.skillName}</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Question {examQuestionIndex + 1} of {test.questions.length}
              </span>
            </div>

            {!examStarted ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  You have {test.timeLimitMinutes} minutes to complete {test.questions.length} questions. You need {test.passingScore}% to pass.
                </p>
                <button type="button" onClick={startExam} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                  Start exam
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <p className="font-medium text-slate-900 dark:text-white mb-4">{currentQuestion?.question}</p>
                <div className="space-y-2">
                  {currentQuestion?.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        examAnswers[currentQuestion.id] === i ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        checked={examAnswers[currentQuestion.id] === i}
                        onChange={() => handleExamAnswer(currentQuestion.id, i)}
                        className="text-indigo-600"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleExamNext}
                  disabled={!canProceedExam}
                  className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
                >
                  {isLastQuestion ? 'Submit exam' : 'Next question'}
                </button>
              </div>
            )}
          </>
        )}

        {step === 'result' && result && test && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            {result.passed ? (
              <>
                <span className="text-5xl block mb-4">🎉</span>
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">You passed!</h2>
                <div className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-4">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">{result.score}%</span>
                  <span className="text-slate-600 dark:text-slate-400">— {result.skillName}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Your score has been saved to your profile.</p>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 mb-6 text-left">
                  <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">You're now available for hire!</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Clients can see your {result.skillName} badge on your profile. Complete your profile, browse jobs, and start applying to get hired.
                  </p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">This badge is visible on your public profile for clients to see.</p>
                <button
                  type="button"
                  onClick={() => navigate(hasCompletedOnboarding(userId) ? '/dashboard' : '/freelancer-onboarding', { replace: true })}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                >
                  {hasCompletedOnboarding(userId) ? 'Go to Dashboard' : 'Continue'}
                </button>
              </>
            ) : (
              <>
                <span className="text-5xl block mb-4">😔</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Not quite</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">You need {test.passingScore}% to pass. Try again or choose a different skill.</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep('skill'); setSelectedSkillId(null); }}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Try different skill
                  </button>
                  <button
                    type="button"
                    onClick={() => { setExamAnswers({}); setExamQuestionIndex(0); setStep('exam'); }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
          <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }); }} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Log out
          </button>
        </p>
      </div>
    </div>
  );
}
