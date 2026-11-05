import { WORDS_BY_ID } from "./words";

export type InsightProgress = {
  completedDates: string[];
  practiceDates: string[];
  dailyPractice: Record<string, { score: number; total: number }>;
  review: Record<string, {
    nextReviewDate: string;
    correctCount: number;
    wrongCount: number;
  }>;
};

function dateKeys(today: string, days: number): string[] {
  const start = new Date(today + "T12:00:00Z");
  if (Number.isNaN(start.getTime())) return [];
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() - (days - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

export function buildLearningInsights(progress: InsightProgress, today: string) {
  const recent = dateKeys(today, 14);
  const completed = new Set(progress.completedDates);
  const practice = new Set(progress.practiceDates);
  const activity = recent.map(date => ({
    date,
    studied: completed.has(date),
    practiced: practice.has(date),
    score: Number(progress.dailyPractice[date]?.score ?? 0),
    total: Number(progress.dailyPractice[date]?.total ?? 0)
  }));
  const last7 = activity.slice(-7);
  const studied7 = last7.filter(day => day.studied).length;
  const practiced7 = last7.filter(day => day.practiced).length;
  const score7 = last7.reduce((sum, day) => sum + day.score, 0);
  const questions7 = last7.reduce((sum, day) => sum + day.total, 0);
  const all = Object.entries(progress.review).filter(([id]) => Boolean(WORDS_BY_ID[id]));
  const due = all.filter(([, value]) => value.nextReviewDate <= today);
  const weak = all.filter(([, state]) => state.wrongCount > 0).sort((a, b) => {
    const riskA = a[1].wrongCount * 2 - a[1].correctCount;
    const riskB = b[1].wrongCount * 2 - b[1].correctCount;
    return riskB - riskA || b[1].wrongCount - a[1].wrongCount || a[0].localeCompare(b[0]);
  }).slice(0, 6).map(([id, state]) => ({
    id, word: WORDS_BY_ID[id].word, level: WORDS_BY_ID[id].level,
    correct: state.correctCount, wrong: state.wrongCount,
    due: state.nextReviewDate <= today
  }));
  const upcoming = due.sort((a,b) => a[1].nextReviewDate.localeCompare(b[1].nextReviewDate))
    .slice(0, 6).map(([id]) => WORDS_BY_ID[id]);
  return {
    activity, studied7, practiced7, score7, questions7,
    accuracy7: questions7 > 0 ? Math.round(100 * score7 / questions7) : null,
    dueCount: due.length, weak, upcoming
  };
}
