"use client";

import { useEffect, useMemo, useState } from "react";
import { WORDS, WORDS_BY_ID } from "@/lib/words";
import { hashString, seededShuffle, selectDailyWords, pendingQuizCycle } from "@/lib/daily-planning";
import { ARTICLES } from "@/lib/articles";
import DailyArticleExperience from "@/components/DailyArticleExperience";
import DailyPracticeExperience from "@/components/DailyPracticeExperience";
import LearningBackupControls from "@/components/LearningBackupControls";
import { buildLearningInsights } from "@/lib/progress-insights";
import { createReviewState, applyReviewResult, type ReviewState } from "@/lib/review-schedule";

type LearnedWord = {
  firstLearnedDate: string;
  lastSeenDate: string;
};

type DailyPracticeRecord = {
  completedAt: string;
  score: number;
  total: number;
};

type QuizResult = {
  cycle: number;
  completedAt: string;
  score: number;
  total: number;
};

type Progress = {
  version: 3;
  streak: number;
  lastStudyDate: string | null;
  completedDates: string[];
  dailyPlans: Record<string, string[]>;
  dailyPracticePlans: Record<string, string[]>;
  practiceDates: string[];
  dailyPractice: Record<string, DailyPracticeRecord>;
  review: Record<string, ReviewState>;
  dailyArticlePlans: Record<string, string>;
  readArticleDates: string[];
  learned: Record<string, LearnedWord>;
  quizResults: QuizResult[];
};

type QuizQuestion = {
  wordId: string;
  prompt: string;
  options: string[];
  answer: string;
};

const STORAGE_KEY = "fastenglish-progress-v1";

const EMPTY_PROGRESS: Progress = {
  version: 3,
  streak: 0,
  lastStudyDate: null,
  completedDates: [],
  dailyPlans: {},
  dailyPracticePlans: {},
  practiceDates: [],
  dailyPractice: {},
  review: {},
  dailyArticlePlans: {},
  readArticleDates: [],
  learned: {},
  quizResults: []
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function buildDailyPlan(dateKey:string,learnedIds:Set<string>){
  return selectDailyWords(dateKey,learnedIds,WORDS);
}

function buildDailyArticlePlan(dateKey: string, assignedIds: Set<string>) {
  const fresh = ARTICLES.filter((article) => !assignedIds.has(article.id));
  const pool = fresh.length > 0 ? fresh : ARTICLES;
  return seededShuffle(pool, hashString("article-" + dateKey))[0]?.id ?? ARTICLES[0].id;
}

function buildDailyPracticePlan(
  progress: Progress,
  dateKey: string,
  todayIds: string[]
) {
  const todaySet = new Set(todayIds);
  const due = Object.entries(progress.review)
    .filter(
      ([id, state]) =>
        !todaySet.has(id) &&
        state.nextReviewDate <= dateKey &&
        Boolean(WORDS_BY_ID[id])
    )
    .map(([id]) => id);

  const recent = progress.completedDates
    .slice(-21)
    .reverse()
    .flatMap((date) => progress.dailyPlans[date] ?? [])
    .filter((id) => Boolean(WORDS_BY_ID[id]) && !todaySet.has(id));

  const duePicked = seededShuffle([...new Set(due)], hashString("due-" + dateKey)).slice(0, 2);
  const fallbackPool = [
    ...duePicked,
    ...seededShuffle(
      [...new Set([...recent, ...todayIds])].filter((id) => !duePicked.includes(id)),
      hashString("fallback-" + dateKey)
    )
  ];

  return [...new Set(fallbackPool)].slice(0, 2);
}

function speak(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.86;
  window.speechSynthesis.speak(utterance);
}

function formatDate(dateKey: string) {
  const parts = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(parts[0], parts[1] - 1, parts[2]));
}

function getPendingCycle(progress: Progress) {
  return pendingQuizCycle(progress.completedDates.length,progress.quizResults);
}

function getCycleWordIds(progress: Progress, cycle: number) {
  const dates = progress.completedDates.slice((cycle - 1) * 7, cycle * 7);
  return [...new Set(dates.flatMap((date) => progress.dailyPlans[date] ?? []))];
}

function buildQuiz(progress: Progress, cycle: number): QuizQuestion[] {
  const ids = getCycleWordIds(progress, cycle);
  const picked = seededShuffle(ids, hashString("cycle-" + cycle + "-quiz")).slice(0, 10);

  return picked
    .map((id, index) => {
      const word = WORDS_BY_ID[id];
      if (!word) return null;

      const distractors = seededShuffle(
        WORDS.filter((entry) => entry.id !== id).map((entry) => entry.meaning),
        hashString(cycle + "-" + id + "-" + index)
      ).slice(0, 3);

      return {
        wordId: id,
        prompt: word.word,
        options: seededShuffle(
          [word.meaning, ...distractors],
          hashString("options-" + cycle + "-" + id)
        ),
        answer: word.meaning
      };
    })
    .filter(Boolean) as QuizQuestion[];
}

export default function FastEnglishApp() {
  const today = localDateKey();
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Progress) : EMPTY_PROGRESS;
      const learnedIds = new Set(Object.keys(parsed.learned ?? {}));
      const dailyPlans = { ...(parsed.dailyPlans ?? {}) };
      const dailyPracticePlans = { ...(parsed.dailyPracticePlans ?? {}) };
      const practiceDates = [...(parsed.practiceDates ?? [])];
      const dailyPractice = { ...(parsed.dailyPractice ?? {}) };
      const review = { ...(parsed.review ?? {}) };
      const dailyArticlePlans = { ...(parsed.dailyArticlePlans ?? {}) };

      Object.keys(parsed.learned ?? {}).forEach((id) => {
        if (!review[id]) {
          review[id] = createReviewState(today);
        }
      });

      if (!dailyPlans[today]?.length) {
        dailyPlans[today] = buildDailyPlan(today, learnedIds);
      }

      if (!dailyPracticePlans[today]?.length) {
        dailyPracticePlans[today] = buildDailyPracticePlan(
          { ...EMPTY_PROGRESS, ...parsed, review, dailyPlans } as Progress,
          today,
          dailyPlans[today]
        );
      }

      if (!dailyArticlePlans[today]) {
        dailyArticlePlans[today] = buildDailyArticlePlan(
          today,
          new Set(Object.values(dailyArticlePlans))
        );
      }

      const next: Progress = {
        ...EMPTY_PROGRESS,
        ...parsed,
        version: 3,
        dailyPlans,
        dailyPracticePlans,
        practiceDates,
        dailyPractice,
        review,
        dailyArticlePlans,
        readArticleDates: parsed.readArticleDates ?? [],
        learned: parsed.learned ?? {},
        completedDates: parsed.completedDates ?? [],
        quizResults: parsed.quizResults ?? []
      };

      setProgress(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setProgress({
        ...EMPTY_PROGRESS,
        dailyPlans: { [today]: buildDailyPlan(today, new Set()) },
        dailyPracticePlans: {
          [today]: buildDailyPracticePlan(
            EMPTY_PROGRESS,
            today,
            buildDailyPlan(today, new Set())
          )
        },
        dailyArticlePlans: {
          [today]: buildDailyArticlePlan(today, new Set())
        }
      });
    } finally {
      setHydrated(true);
    }
  }, [today]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // The app still works for the current tab if browser storage is unavailable.
    }
  }, [progress, hydrated]);

  const todayIds = progress.dailyPlans[today] ?? [];
  const todayWords = todayIds.map((id) => WORDS_BY_ID[id]).filter(Boolean);
  const practiceIds = progress.dailyPracticePlans[today] ?? [];
  const practiceWords = practiceIds.map((id) => WORDS_BY_ID[id]).filter(Boolean);
  const practiceCompletedToday = progress.practiceDates.includes(today);
  const completedToday = progress.completedDates.includes(today);
  const pendingCycle = getPendingCycle(progress);
  const quiz = useMemo(
    () => (pendingCycle ? buildQuiz(progress, pendingCycle) : []),
    // Quiz depends on word assignments and completed days, not on unrelated
    // progress updates such as practice marks, notes or reveal state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingCycle, progress.completedDates, progress.dailyPlans]
  );

  const revealedToday = completedToday
    ? todayIds.length
    : Object.keys(revealed).filter(
        (id) => todayIds.includes(id) && revealed[id]
      ).length;
  const cycleProgress = progress.completedDates.length % 7;
  const nextQuizIn = pendingCycle
    ? 0
    : cycleProgress === 0 && progress.completedDates.length > 0
      ? 7
      : 7 - cycleProgress;
  const learnedCount = Object.keys(progress.learned).length;
  const latestQuiz = progress.quizResults.at(-1);
  const insights = useMemo(() => buildLearningInsights(progress, today, WORDS_BY_ID), [progress, today]);
  const displayStreak =
    progress.lastStudyDate === today || progress.lastStudyDate === yesterdayKey()
      ? progress.streak
      : 0;

  function completeToday() {
    if (
      completedToday ||
      todayIds.length === 0 ||
      revealedToday < todayIds.length ||
      !practiceCompletedToday
    ) {
      return;
    }

    const nextLearned = { ...progress.learned };
    const nextReview = { ...progress.review };

    todayIds.forEach((id) => {
      nextLearned[id] = {
        firstLearnedDate: nextLearned[id]?.firstLearnedDate ?? today,
        lastSeenDate: today
      };
      if (!nextReview[id]) {
        nextReview[id] = createReviewState(today);
      }
    });

    setProgress((current) => ({
      ...current,
      streak: current.lastStudyDate === yesterdayKey() ? displayStreak + 1 : 1,
      lastStudyDate: today,
      completedDates: [...current.completedDates, today].sort(),
      learned: nextLearned,
      review: nextReview
    }));
  }

  function handlePracticeResult(wordId: string, correct: boolean) {
    setProgress((current) => {
      const currentState = current.review[wordId] ?? createReviewState(today);
      return {
        ...current,
        review: {
          ...current.review,
          [wordId]: applyReviewResult(currentState, correct, today)
        }
      };
    });
  }

  function completeDailyPractice(score: number, total: number) {
    setProgress((current) => {
      if (current.practiceDates.includes(today)) return current;
      return {
        ...current,
        practiceDates: [...current.practiceDates, today].sort(),
        dailyPractice: {
          ...current.dailyPractice,
          [today]: {
            completedAt: new Date().toISOString(),
            score,
            total
          }
        }
      };
    });
  }

  function markArticleRead(date: string) {
    setProgress((current) => ({
      ...current,
      readArticleDates: current.readArticleDates.includes(date)
        ? current.readArticleDates
        : [...current.readArticleDates, date].sort()
    }));
  }

  function submitQuiz() {
    if (!pendingCycle || quiz.length === 0) return;
    if (Object.keys(quizAnswers).length < quiz.length) return;

    const score = quiz.reduce(
      (total, question) =>
        total + (quizAnswers[question.wordId] === question.answer ? 1 : 0),
      0
    );

    setQuizScore(score);
    setQuizSubmitted(true);
  }

  function finishQuiz() {
    if (!pendingCycle || quizScore === null) return;

    setProgress((current) => ({
      ...current,
      quizResults: [
        ...current.quizResults,
        {
          cycle: pendingCycle,
          completedAt: new Date().toISOString(),
          score: quizScore,
          total: quiz.length
        }
      ]
    }));

    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }

  function resetProgress() {
    if (!window.confirm("Xóa toàn bộ streak, lịch sử từ và điểm kiểm tra trên trình duyệt này?")) {
      return;
    }

    const resetDailyPlan = buildDailyPlan(today, new Set());
    setProgress({
      ...EMPTY_PROGRESS,
      dailyPlans: { [today]: resetDailyPlan },
      dailyPracticePlans: {
        [today]: buildDailyPracticePlan(EMPTY_PROGRESS, today, resetDailyPlan)
      },
      dailyArticlePlans: {
        [today]: buildDailyArticlePlan(today, new Set())
      }
    });
    setRevealed({});
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }

  if (!hydrated) {
    return (
      <main className="app-shell loading-shell">
        <div className="loading-card">Đang chuẩn bị 5 từ hôm nay…</div>
      </main>
    );
  }

  return (
    <main className="app-shell" id="top">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="FastEnglish – về đầu trang">
          <span className="brand-mark">F</span>
          <span>
            <strong>FastEnglish</strong>
            <small>5 từ mới mỗi ngày</small>
          </span>
        </a>
        <nav className="quick-nav" aria-label="Điều hướng học tập">
          <a href="#today" className="quick-nav-primary">Học hôm nay</a>
          <a href="#daily-practice">Luyện tập</a>
          <a href="#daily-reading">Bài đọc</a>
          <a href="#history">Lịch sử</a>
          <a href="#learning-insights">Phân tích</a>
          <a href="/review">Ôn tất cả từ</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">5 TỪ MỚI · MỖI NGÀY MỘT CHÚT</span>
          <h1>Giỏi tiếng Anh hơn, <em>từng ngày.</em></h1>
          <p>
            5 từ vựng B2–C2, 2 bài luyện nhớ chủ động và một bài đọc ngắn.
            Học vừa sức, ôn đúng lúc, tiến bộ theo nhịp của bạn.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#today">
              {completedToday ? "Xem lại bài hôm nay" : "Bắt đầu học hôm nay"} <span aria-hidden="true">↓</span>
            </a>
            <span className="today-label">{formatDate(today)}</span>
          </div>
          <div className="today-checklist" aria-live="polite">
            <div className="today-checklist-title">
              <strong>Tiến độ hôm nay</strong>
              <span>{completedToday ? "Đã hoàn thành ✓" : revealedToday + "/" + todayWords.length + " từ đã mở"}</span>
            </div>
            <div
              className="progress-track today-progress-track"
              role="progressbar"
              aria-label="Số từ đã mở nghĩa hôm nay"
              aria-valuemin={0}
              aria-valuemax={todayWords.length}
              aria-valuenow={revealedToday}
            >
              <div className="progress-fill" style={{
                width: (todayWords.length ? (revealedToday / todayWords.length) * 100 : 0) + "%"
              }} />
            </div>
            <div className="today-checklist-foot">
              <span>{practiceCompletedToday ? "✓ Đã xong 2 bài ôn" : "○ Còn 2 bài ôn ngắn"}</span>
              <a href="#daily-practice">Tới bài ôn →</a>
            </div>
          </div>
        </div>

        <div className="streak-card">
          <div className="streak-flame">🔥</div>
          <div>
            <span className="metric-label">Chuỗi hiện tại</span>
            <strong className="streak-number">{displayStreak}</strong>
            <span className="metric-unit">ngày</span>
          </div>
          <div className="mini-progress">
            <span>
              {pendingCycle ? "Weekly review đang chờ" : "Còn " + nextQuizIn + " buổi tới review"}
            </span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width:
                    (pendingCycle ? 100 : Math.min(100, (cycleProgress / 7) * 100)) + "%"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Thống kê học tập">
        <article>
          <span className="stat-icon">◫</span>
          <div><strong>{learnedCount}</strong><span>Từ đã học</span></div>
        </article>
        <article>
          <span className="stat-icon">✓</span>
          <div><strong>{progress.completedDates.length}</strong><span>Buổi hoàn thành</span></div>
        </article>
        <article>
          <span className="stat-icon">☰</span>
          <div><strong>{progress.readArticleDates.length}</strong><span>Bài đã đọc</span></div>
        </article>
        <article>
          <span className="stat-icon">✦</span>
          <div>
            <strong>{latestQuiz ? latestQuiz.score + "/" + latestQuiz.total : "—"}</strong>
            <span>Review gần nhất</span>
          </div>
        </article>
      </section>

      <section className="learning-insights" id="learning-insights" aria-labelledby="insights-title">
        <div className="section-heading">
          <div><span className="eyebrow">PERSONAL LEARNING ANALYTICS</span>
            <h2 id="insights-title">Học đều, nhớ sâu.</h2>
            <p>Thống kê thực từ lịch sử học trên thiết bị này, cập nhật sau mỗi buổi.</p>
          </div>
          <a href="/review" className="review-link">Ôn tất cả từ đến hạn →</a>
        </div>
        <div className="insight-metrics">
          <article><strong>{insights.studied7}/7</strong><span>Ngày học trong 7 ngày</span></article>
          <article><strong>{insights.practiced7}/7</strong><span>Ngày đã luyện</span></article>
          <article><strong>{insights.accuracy7===null?"—":insights.accuracy7+"%"}</strong><span>Độ chính xác 7 ngày</span></article>
          <article><strong>{insights.dueCount}</strong><span>Từ đến hạn ôn</span></article>
        </div>
        <div className="insight-panels">
          <article className="insight-panel">
            <h3>Nhịp học 14 ngày</h3>
            <div className="insight-days" role="img" aria-label={"14 ngày: "+insights.activity.filter(day=>day.studied).length+" ngày đã hoàn thành"}>
              {insights.activity.map(day=><div key={day.date} className={"insight-day "+(day.studied?"studied":day.practiced?"practiced":"")} title={day.date+": "+(day.studied?"Đã hoàn thành":day.practiced?"Đã luyện tập":"Chưa học")}>
                <span aria-hidden="true">{day.date.slice(-2)}</span>
              </div>)}
            </div>
            <p>Ô xanh đậm: hoàn thành đủ bài. Ô xanh nhạt: đã luyện nhưng chưa hoàn tất.</p>
          </article>
          <article className="insight-panel">
            <h3>Từ cần củng cố</h3>
            {insights.weak.length?<div className="insight-weak-list">
              {insights.weak.map(word=><div key={word.id}>
                <button type="button" onClick={()=>speak(word.word)} aria-label={"Phát âm "+word.word}>◖))</button>
                <strong>{word.word}</strong><small>{word.level}</small><span>{word.wrong} lần sai · {word.correct} lần đúng{word.due?" · Đến hạn":""}</span>
              </div>)}
            </div>:<p>Chưa có từ nào mắc lỗi. Tiếp tục luyện mỗi ngày để có phân tích cá nhân.</p>}
          </article>
        </div>
      </section>

      {pendingCycle && (
        <section className="review-callout">
          <div>
            <span className="eyebrow">WEEKLY REVIEW #{pendingCycle}</span>
            <h2>Đã đủ 7 buổi. Kiểm tra trí nhớ thôi.</h2>
            <p>10 câu được lấy từ chính nhóm từ bạn đã học trong chu kỳ này.</p>
          </div>
          <a className="review-link" href="#weekly-review">Làm bài ngay →</a>
        </section>
      )}

      <section className="today-section" id="today">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TODAY&apos;S FIVE</span>
            <h2>5 từ của hôm nay</h2>
          </div>
          <div className="level-legend">
            <span className="badge b2">B2</span>
            <span className="badge c1">C1</span>
            <span className="badge c2">C2</span>
          </div>
        </div>

        <div className="word-grid">
          {todayWords.map((entry, index) => {
            const isRevealed = completedToday || Boolean(revealed[entry.id]);
            return (
              <article className={"word-card " + (isRevealed ? "revealed" : "")} key={entry.id}>
                <div className="word-card-top">
                  <span className={"badge " + entry.level.toLowerCase()}>{entry.level}</span>
                  <span className="word-index">0{index + 1}</span>
                </div>

                <div className="word-line">
                  <h3>{entry.word}</h3>
                  <button
                    className="speak-button"
                    onClick={() => speak(entry.word)}
                    aria-label={"Phát âm " + entry.word}
                  >
                    ◖))
                  </button>
                </div>
                <span className="part-of-speech">{entry.partOfSpeech}</span>

                {!isRevealed ? (
                  <button
                    className="reveal-button"
                    aria-label={"Xem nghĩa của từ " + entry.word}
                    onClick={() =>
                      setRevealed((current) => ({ ...current, [entry.id]: true }))
                    }
                  >
                    Chạm để xem nghĩa
                  </button>
                ) : (
                  <div className="word-detail">
                    <strong>{entry.meaning}</strong>
                    <p>{entry.definition}</p>
                    <blockquote>{entry.example}</blockquote>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <DailyPracticeExperience
          words={practiceWords}
          completed={practiceCompletedToday}
          onResult={handlePracticeResult}
          onComplete={completeDailyPractice}
        />

        <div className="complete-row">
          <div>
            <strong>
              {completedToday
                ? "Hôm nay đã hoàn thành ✓"
                : revealedToday + "/5 từ đã mở nghĩa · " +
                  (practiceCompletedToday ? "2/2 bài ôn ✓" : "còn 2 bài ôn")}
            </strong>
            <span>
              {completedToday
                ? "Streak đã được cập nhật trên trình duyệt này."
                : "Làm đủ 5 từ + 2 bài ôn để tính là một ngày hoàn thành."}
            </span>
          </div>
          <button
            className="primary-button"
            disabled={
              completedToday ||
              revealedToday < todayIds.length ||
              !practiceCompletedToday
            }
            onClick={completeToday}
          >
            {completedToday ? "Đã giữ chuỗi hôm nay" : "Hoàn thành ngày học"}
          </button>
        </div>
      </section>

      <DailyArticleExperience
        today={today}
        assignments={progress.dailyArticlePlans}
        readDates={progress.readArticleDates}
        onMarkRead={markArticleRead}
      />

      <section className="history-section" id="history">
        <div className="section-heading">
          <div>
            <span className="eyebrow">RECENT DAYS</span>
            <h2>Nhịp học gần đây</h2>
          </div>
        </div>

        <div className="history-strip">
          {progress.completedDates.length === 0 ? (
            <div className="empty-history">Hoàn thành hôm nay để bắt đầu lịch sử học.</div>
          ) : (
            progress.completedDates.slice(-14).reverse().map((date) => (
              <div className="history-day" key={date}>
                <span>✓</span>
                <strong>{formatDate(date)}</strong>
                <small>{(progress.dailyPlans[date] ?? []).length} từ</small>
              </div>
            ))
          )}
        </div>
      </section>

      {pendingCycle && (
        <section className="quiz-section" id="weekly-review">
          <div className="section-heading">
            <div>
              <span className="eyebrow">7-DAY CHECKPOINT</span>
              <h2>Weekly Review #{pendingCycle}</h2>
            </div>
            <span className="quiz-counter">
              {Object.keys(quizAnswers).length}/{quiz.length} đã chọn
            </span>
          </div>

          <div className="quiz-grid">
            {quiz.map((question, index) => (
              <article className="quiz-card" key={question.wordId}>
                <span className="quiz-number">Câu {index + 1}</span>
                <h3>{question.prompt}</h3>
                <p>Chọn nghĩa phù hợp nhất:</p>

                <div className="options">
                  {question.options.map((option) => {
                    const selected = quizAnswers[question.wordId] === option;
                    const isCorrect = quizSubmitted && option === question.answer;
                    const isWrong =
                      quizSubmitted && selected && option !== question.answer;

                    return (
                      <button
                        key={option}
                        disabled={quizSubmitted}
                        className={
                          (selected ? "selected " : "") +
                          (isCorrect ? "correct " : "") +
                          (isWrong ? "wrong" : "")
                        }
                        onClick={() =>
                          setQuizAnswers((current) => ({
                            ...current,
                            [question.wordId]: option
                          }))
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="quiz-submit">
            {!quizSubmitted ? (
              <button
                className="primary-button"
                disabled={Object.keys(quizAnswers).length < quiz.length}
                onClick={submitQuiz}
              >
                Chấm bài review
              </button>
            ) : (
              <div className="quiz-result">
                <div>
                  <span>Kết quả</span>
                  <strong>{quizScore}/{quiz.length}</strong>
                </div>
                <button className="primary-button" onClick={finishQuiz}>
                  Hoàn tất review
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <LearningBackupControls />
      <footer>
        <div className="brand compact">
          <span className="brand-mark">F</span>
          <strong>FastEnglish</strong>
        </div>
        <div className="footer-meta">
          <p>5 từ mới · 2 bài ôn · 1 bài đọc mỗi ngày.</p>
          <p>Dữ liệu học được lưu trên trình duyệt này. Xóa dữ liệu web sẽ mất tiến độ.</p>
        </div>
        <button className="ghost-button footer-reset" onClick={resetProgress}>
          Xóa tiến độ trên máy này
        </button>
      </footer>
    </main>
  );
}
