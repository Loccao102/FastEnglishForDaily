"use client";

import { useEffect, useMemo, useState } from "react";
import { CefrLevel, WORDS, WORDS_BY_ID } from "@/lib/words";
import { ARTICLES } from "@/lib/articles";
import DailyArticleExperience from "@/components/DailyArticleExperience";
import DailyPracticeExperience from "@/components/DailyPracticeExperience";

type LearnedWord = {
  firstLearnedDate: string;
  lastSeenDate: string;
};

type ReviewState = {
  box: number;
  nextReviewDate: string;
  correctCount: number;
  wrongCount: number;
  lastReviewedDate: string | null;
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

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  const random = mulberry32(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function buildDailyPlan(dateKey: string, learnedIds: Set<string>) {
  const seed = hashString(dateKey);
  const patterns: CefrLevel[][] = [
    ["B2", "C1", "B2", "C2", "C1"],
    ["C1", "B2", "C2", "B2", "C1"],
    ["B2", "C2", "C1", "C1", "B2"],
    ["C2", "B2", "C1", "B2", "C1"]
  ];
  const levels = patterns[seed % patterns.length];
  const used = new Set<string>();
  const result: string[] = [];

  levels.forEach((level, index) => {
    const fresh = WORDS.filter(
      (entry) => entry.level === level && !learnedIds.has(entry.id) && !used.has(entry.id)
    );
    const fallback = WORDS.filter(
      (entry) => entry.level === level && !used.has(entry.id)
    );
    const pool = fresh.length > 0 ? fresh : fallback;
    const pick = seededShuffle(pool, seed + index * 997)[0];

    if (pick) {
      used.add(pick.id);
      result.push(pick.id);
    }
  });

  return result;
}

function buildDailyArticlePlan(dateKey: string, assignedIds: Set<string>) {
  const fresh = ARTICLES.filter((article) => !assignedIds.has(article.id));
  const pool = fresh.length > 0 ? fresh : ARTICLES;
  return seededShuffle(pool, hashString("article-" + dateKey))[0]?.id ?? ARTICLES[0].id;
}

function addDays(dateKey: string, days: number) {
  const parts = dateKey.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function createReviewState(dateKey: string): ReviewState {
  return {
    box: 0,
    nextReviewDate: addDays(dateKey, 1),
    correctCount: 0,
    wrongCount: 0,
    lastReviewedDate: null
  };
}

function applyReviewResult(
  state: ReviewState,
  correct: boolean,
  dateKey: string
): ReviewState {
  if (!correct) {
    return {
      ...state,
      box: 0,
      nextReviewDate: addDays(dateKey, 1),
      wrongCount: state.wrongCount + 1,
      lastReviewedDate: dateKey
    };
  }

  const nextBox = Math.min(5, state.box + 1);
  const intervals = [1, 2, 4, 7, 14, 30];
  return {
    ...state,
    box: nextBox,
    nextReviewDate: addDays(dateKey, intervals[nextBox]),
    correctCount: state.correctCount + 1,
    lastReviewedDate: dateKey
  };
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
  const eligibleCycles = Math.floor(progress.completedDates.length / 7);
  for (let cycle = 1; cycle <= eligibleCycles; cycle += 1) {
    if (!progress.quizResults.some((result) => result.cycle === cycle)) {
      return cycle;
    }
  }
  return null;
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
    [pendingCycle, progress]
  );

  const revealedToday = Object.keys(revealed).filter(
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
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="topbar">
        <a className="brand" href="#today" aria-label="FastEnglish">
          <span className="brand-mark">F</span>
          <span>
            <strong>FastEnglish</strong>
            <small>5 words • every day</small>
          </span>
        </a>
        <button className="ghost-button" onClick={resetProgress}>Reset local</button>
      </section>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">DAILY ADVANCED ENGLISH</span>
          <h1>Ít thôi. Nhưng <em>mỗi ngày.</em></h1>
          <p>
            Mỗi ngày 5 từ B2–C2, 2 bài ôn ngắn và một bài đọc kiến thức tùy chọn.
            Học đều để giữ chuỗi, nhớ từ lâu hơn và sau mỗi 7 buổi làm một bài review.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#today">
              Học 5 từ hôm nay <span>↓</span>
            </a>
            <span className="today-label">{formatDate(today)}</span>
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

      <section className="stats-grid">
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
            const isRevealed = revealed[entry.id];
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

      <section className="history-section">
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

      <footer>
        <div className="brand compact">
          <span className="brand-mark">F</span>
          <strong>FastEnglish</strong>
        </div>
        <p>5 words + 2 practice + 1 idea today. Better English tomorrow.</p>
      </footer>
    </main>
  );
}
