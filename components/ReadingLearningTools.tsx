"use client";

import { useEffect, useMemo, useState } from "react";
import type { KnowledgeArticle } from "@/lib/articles";
import { ARTICLES_BY_ID } from "@/lib/articles";
import { WORDS } from "@/lib/words";
import {
  buildOfflineReadingQuiz, validReadingQuestions,
  type ReadingQuizResult
} from "@/lib/reading-quiz";

type Marker = {
  id: string;
  articleId: string;
  text: string;
  note: string;
  paragraphIndex: number;
  start: number;
  end: number;
};
type CardState = { level: number; due: string; reviewed: number; lastReviewed: string | null };
type CardProgress = Record<string, CardState>;

const CARD_STORAGE_KEY = "fastenglish-reading-flashcards-v1";
const INTERVALS = [1, 3, 7, 14, 30, 60];

function localKey(date: Date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}
function futureDate(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return localKey(d);
}

function definition(marker: Marker) {
  const norm = marker.text.trim().toLocaleLowerCase("en");
  const article = ARTICLES_BY_ID[marker.articleId];
  const articleMeaning = article?.vocabulary.find((v) => v.word.toLocaleLowerCase("en") === norm)?.meaning;
  const known = WORDS.find((word) => word.word.toLocaleLowerCase("en") === norm);
  return articleMeaning || known?.meaning || marker.note.trim() || "";
}

function context(marker: Marker) {
  const article = ARTICLES_BY_ID[marker.articleId];
  const text = article?.paragraphs[marker.paragraphIndex];
  if (!text) return article?.summary || "";
  return text.slice(Math.max(0, marker.start - 75), Math.min(text.length, marker.end + 75));
}

function sayWord(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = "en-US";
  voice.rate = 0.85;
  window.speechSynthesis.speak(voice);
}

export default function ReadingLearningTools({
  article, markers
}: { article: KnowledgeArticle; markers: Marker[] }) {
  const [progress, setProgress] = useState<CardProgress>({});
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [studyAll, setStudyAll] = useState(true);
  const [quiz, setQuiz] = useState<ReadingQuizResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [graded, setGraded] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizNotice, setQuizNotice] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CARD_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setProgress(parsed as CardProgress);
      }
    } catch {
      setProgress({});
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Learning works in memory when browser storage is disabled.
    }
  }, [progress, loaded]);

  useEffect(() => {
    setQuiz(null);
    setAnswers({});
    setGraded(false);
    setQuizNotice("");
  }, [article.id]);

  const deck = useMemo(
    () => markers.filter((marker) =>
      marker.text.trim().length >= 2 &&
      marker.text.trim().length <= 120 &&
      (studyAll || marker.articleId === article.id)
    ),
    [markers, studyAll, article.id]
  );
  const today = localKey(new Date());
  const due = deck.filter((marker) => {
    const state = progress[marker.id];
    return !state || typeof state.due !== "string" || state.due <= today;
  });
  const current = due[0];
  const learned = deck.filter((marker) => progress[marker.id]?.reviewed > 0).length;

  function gradeCard(remembered: boolean) {
    if (!current || !revealed) return;
    setProgress((previous) => {
      const earlier = previous[current.id];
      const nextLevel = remembered ? Math.min(5, (earlier?.level ?? -1) + 1) : 0;
      return {
        ...previous,
        [current.id]: {
          level: nextLevel,
          due: futureDate(remembered ? INTERVALS[nextLevel] : 1),
          reviewed: (earlier?.reviewed || 0) + 1,
          lastReviewed: today
        }
      };
    });
    setRevealed(false);
  }

  function startOfflineQuiz() {
    setQuiz(buildOfflineReadingQuiz(article));
    setAnswers({});
    setGraded(false);
    setQuizNotice("");
  }

  async function requestAIQuiz() {
    setQuizLoading(true);
    setQuizNotice("");
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 19000);
      let response: Response;
      try {
        response = await fetch("/api/reading-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId: article.id }),
          signal: controller.signal
        });
      } finally {
        window.clearTimeout(timeout);
      }
      if (!response.ok) throw new Error("Server error");
      const data: unknown = await response.json();
      const parsed = data as Partial<ReadingQuizResult>;
      if (!validReadingQuestions(parsed.questions)) throw new Error("Invalid quiz");
      setQuiz({ source: parsed.source === "ai" ? "ai" : "offline", questions: parsed.questions });
      setAnswers({});
      setGraded(false);
      if (parsed.source !== "ai") {
        setQuizNotice("Chưa có AI khả dụng; đang dùng bộ câu hỏi dựa trên nội dung bài đọc.");
      }
    } catch {
      startOfflineQuiz();
      setQuizNotice("Chưa kết nối được AI; đã chuyển sang câu hỏi có sẵn.");
    } finally {
      setQuizLoading(false);
    }
  }

  const questions = quiz?.questions || [];
  const completed = questions.length > 0 && Object.keys(answers).length === questions.length;
  const score = graded ? questions.filter((q) => answers[q.id] === q.answerIndex).length : 0;

  return (
    <section className="reading-learning-studio" aria-label="Luyện tập đọc hiểu và ôn flashcard">
      <div className="learning-studio-header">
        <span className="eyebrow">TURN HIGHLIGHTS INTO KNOWLEDGE</span>
        <h3>Đọc xong, nhớ lâu hơn.</h3>
        <p>Ôn chính những từ bạn đã lưu và kiểm tra xem mình hiểu bài tới đâu.</p>
      </div>
      <div className="learning-tools-grid">
        <section className="learning-tool-panel" id="reading-flashcards">
          <div className="learning-panel-heading">
            <span className="learning-tool-icon">◈</span>
            <div>
              <h4>Flashcard của bạn</h4>
              <p>{deck.length} thẻ · {due.length} cần ôn · {learned} đã từng ôn</p>
            </div>
          </div>
          <div className="study-scope" role="group" aria-label="Chọn phạm vi ôn tập">
            <button className={!studyAll ? "active" : ""} onClick={() => { setStudyAll(false); setRevealed(false); }}>
              Bài này
            </button>
            <button className={studyAll ? "active" : ""} onClick={() => { setStudyAll(true); setRevealed(false); }}>
              Tất cả bài
            </button>
          </div>
          {!loaded ? (
            <div className="study-placeholder">Đang tải sổ từ…</div>
          ) : !deck.length ? (
            <div className="study-placeholder">Hãy highlight vài từ hoặc cụm từ trong bài để tạo thẻ học.</div>
          ) : !current ? (
            <div className="study-placeholder">
              <strong>✓ Đã ôn hết hôm nay!</strong>
              <span>Thẻ sẽ xuất hiện lại vào ngày ôn tiếp theo. Bạn có thể tiếp tục đọc bài mới.</span>
            </div>
          ) : (
            <>
              <div className="learning-flashcard">
                <span className="flashcard-eyebrow">{revealed ? "BACK • NGHĨA & NGỮ CẢNH" : "FRONT • TRY TO RECALL"}</span>
                <strong>{current.text}</strong>
                {!revealed ? (
                  <button className="flashcard-reveal" onClick={() => setRevealed(true)}>
                    Hiện nghĩa và ngữ cảnh →
                  </button>
                ) : (
                  <div className="flashcard-back">
                    <p className="flashcard-meaning">{definition(current) || "Chưa có nghĩa. Bạn có thể tự ghi trong sổ tay highlight."}</p>
                    <blockquote>{context(current)}</blockquote>
                    <button className="flashcard-speak" onClick={() => sayWord(current.text)}>◖)) Nghe phát âm</button>
                  </div>
                )}
              </div>
              <div className="flashcard-grade">
                <button disabled={!revealed} onClick={() => gradeCard(false)}>↻ Chưa nhớ</button>
                <button disabled={!revealed} onClick={() => gradeCard(true)}>✓ Nhớ rồi</button>
              </div>
              <p className="flashcard-hint">Hệ thống sẽ giãn khoảng ôn 1, 3, 7, 14, 30, 60 ngày tùy kết quả.</p>
            </>
          )}
        </section>

        <section className="learning-tool-panel" id="reading-comprehension">
          <div className="learning-panel-heading">
            <span className="learning-tool-icon">✳</span>
            <div>
              <h4>Reading comprehension</h4>
              <p>5 câu hỏi · chấm điểm và giải thích ngay</p>
            </div>
          </div>
          {!quiz ? (
            <div className="reading-quiz-intro">
              <p>Kiểm tra ý chính, suy luận và từ vựng trong bài. Có bộ câu hỏi không cần mạng; AI có thể tạo câu hỏi mới khi được cấu hình.</p>
              <button className="primary-button" onClick={startOfflineQuiz}>Làm 5 câu đọc hiểu →</button>
              <button className="quiz-ai-button" disabled={quizLoading} onClick={requestAIQuiz}>
                {quizLoading ? "Đang tạo câu hỏi…" : "✦ Thử tạo câu hỏi bằng AI"}
              </button>
              {quizNotice && <p role="status">{quizNotice}</p>}
            </div>
          ) : (
            <div className="reading-quiz">
              <div className="quiz-intro-bar">
                <span>{quiz.source === "ai" ? "✦ AI-generated" : "✓ Bộ câu hỏi theo bài"}</span>
                <button onClick={() => {
                  setQuiz(null); setAnswers({}); setGraded(false); setQuizNotice("");
                }}>Làm bộ khác ↻</button>
              </div>
              {quizNotice && <p className="quiz-notice" role="status">{quizNotice}</p>}
              {questions.map((question, index) => (
                <fieldset className="reading-quiz-question" key={question.id} disabled={graded}>
                  <legend><span>Câu {index + 1}.</span> {question.prompt}</legend>
                  {question.options.map((option, optionIndex) => {
                    const checked = answers[question.id] === optionIndex;
                    const right = graded && question.answerIndex === optionIndex;
                    const wrong = graded && checked && !right;
                    return (
                      <label key={optionIndex}
                        className={"reading-quiz-option" + (checked ? " selected" : "") +
                          (right ? " correct" : "") + (wrong ? " wrong" : "")}>
                        <input type="radio" name={article.id + "-" + question.id}
                          checked={checked}
                          onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))} />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                  {graded && (
                    <p className="reading-quiz-explanation">
                      <strong>{answers[question.id] === question.answerIndex ? "✓ Chính xác. " : "↻ Cần xem lại. "}</strong>
                      {question.explanation}
                    </p>
                  )}
                </fieldset>
              ))}
              {!graded ? (
                <button className="primary-button reading-quiz-submit" disabled={!completed}
                  onClick={() => setGraded(true)}>
                  Chấm bài ({Object.keys(answers).length}/{questions.length})
                </button>
              ) : (
                <div className="reading-quiz-result">
                  <strong>{score}/{questions.length} câu đúng</strong>
                  <span>{score === questions.length ? "Rất tốt! Bạn đã nắm được bài." : "Xem giải thích ở từng câu để hiểu sâu hơn nhé."}</span>
                  <button onClick={startOfflineQuiz}>Ôn lại với bộ câu hỏi cơ bản ↻</button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
