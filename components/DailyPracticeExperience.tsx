"use client";

import { useMemo, useState } from "react";
import { WORDS, type WordEntry } from "@/lib/words";

type DailyPracticeProps = {
  words: WordEntry[];
  completed: boolean;
  onResult: (wordId: string, correct: boolean) => void;
  onComplete: (score: number, total: number) => void;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^()|[\]\\]/g, "\\$&");
}

function buildBlankSentence(word: WordEntry) {
  const regex = new RegExp("\\b" + escapeRegExp(word.word) + "\\b", "i");
  const replaced = word.example.replace(regex, "_____");
  return replaced === word.example
    ? "Use the word \"" + word.word + "\" in the sentence."
    : replaced;
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  let value = seed || 1;

  for (let index = result.length - 1; index > 0; index -= 1) {
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    const random = ((value >>> 0) % 100000) / 100000;
    const randomIndex = Math.floor(random * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

export default function DailyPracticeExperience({
  words,
  completed,
  onResult,
  onComplete
}: DailyPracticeProps) {
  const [fillAnswer, setFillAnswer] = useState<string | null>(null);
  const [fillSubmitted, setFillSubmitted] = useState(false);
  const [sentence, setSentence] = useState("");
  const [sentenceChecked, setSentenceChecked] = useState(false);
  const [sentenceRated, setSentenceRated] = useState<boolean | null>(null);

  const fillWord = words[0];
  const sentenceWord = words[1] ?? words[0];

  const fillOptions = useMemo(() => {
    if (!fillWord) return [];

    const sameLevel = WORDS.filter(
      (entry) =>
        entry.id !== fillWord.id &&
        entry.level === fillWord.level &&
        entry.partOfSpeech === fillWord.partOfSpeech
    );

    const fallback = WORDS.filter((entry) => entry.id !== fillWord.id);
    const pool = sameLevel.length >= 3 ? sameLevel : fallback;

    return seededShuffle(
      [fillWord, ...seededShuffle(pool, hashString(fillWord.id))].slice(0, 4),
      hashString("practice-options-" + fillWord.id)
    );
  }, [fillWord]);

  if (!fillWord || !sentenceWord) {
    return null;
  }

  const fillCorrect = fillAnswer === fillWord.word;

  function chooseFillAnswer(answer: string) {
    if (fillSubmitted || completed) return;
    setFillAnswer(answer);
    setFillSubmitted(true);
    onResult(fillWord.id, answer === fillWord.word);
  }

  function checkSentence() {
    if (completed || sentenceChecked || sentence.trim().length < 4) return;
    setSentenceChecked(true);
  }

  function rateSentence(correct: boolean) {
    if (completed || !sentenceChecked || sentenceRated !== null) return;

    setSentenceRated(correct);
    onResult(sentenceWord.id, correct);

    const fillScore = fillCorrect ? 1 : 0;
    onComplete(fillScore + (correct ? 1 : 0), 2);
  }

  if (completed) {
    return (
      <section className="daily-practice-section" id="daily-practice">
        <div className="practice-complete">
          <div>
            <span className="eyebrow">DAILY PRACTICE</span>
            <h2>2 bài ôn hôm nay đã xong ✓</h2>
            <p>Ngày mai hệ thống sẽ ưu tiên những từ đến lượt ôn lại.</p>
          </div>
          <span className="practice-complete-mark">✓</span>
        </div>
      </section>
    );
  }

  return (
    <section className="daily-practice-section" id="daily-practice">
      <div className="section-heading practice-heading">
        <div>
          <span className="eyebrow">ACTIVE RECALL • ~7 MIN</span>
          <h2>Ôn bằng cách tự dùng từ</h2>
        </div>
        <span className="reading-count">2 bài · không cần AI chấm</span>
      </div>

      <div className="practice-intro">
        <strong>Đừng chỉ nhìn nghĩa.</strong>
        <span>Một bài nhận diện + một bài tự đặt câu để buộc bạn gọi từ ra khỏi trí nhớ.</span>
      </div>

      <div className="practice-grid">
        <article className="practice-card">
          <div className="practice-card-top">
            <span className="practice-number">01</span>
            <span className="practice-type">Điền từ</span>
          </div>

          <p className="practice-instruction">
            Chọn từ phù hợp nhất để hoàn thành câu.
          </p>

          <blockquote className="practice-sentence">
            {buildBlankSentence(fillWord)}
          </blockquote>

          <div className="practice-options">
            {fillOptions.map((option) => {
              const selected = fillAnswer === option.word;
              const correct = fillSubmitted && option.word === fillWord.word;
              const wrong = fillSubmitted && selected && !correct;

              return (
                <button
                  key={option.id}
                  className={
                    (selected ? "selected " : "") +
                    (correct ? "correct " : "") +
                    (wrong ? "wrong" : "")
                  }
                  disabled={fillSubmitted}
                  onClick={() => chooseFillAnswer(option.word)}
                >
                  {option.word}
                </button>
              );
            })}
          </div>

          {fillSubmitted && (
            <div className={"practice-feedback " + (fillCorrect ? "good" : "bad")}>
              <strong>{fillCorrect ? "Đúng." : "Chưa đúng."}</strong>
              <span>
                {fillCorrect
                  ? "Bạn vừa gọi được từ ra khỏi trí nhớ."
                  : "Đáp án đúng là \"" + fillWord.word + "\". Không sao, từ này sẽ được ôn sớm hơn."}
              </span>
            </div>
          )}
        </article>

        <article className="practice-card">
          <div className="practice-card-top">
            <span className="practice-number">02</span>
            <span className="practice-type">Đặt câu</span>
          </div>

          <p className="practice-instruction">
            Viết một câu của riêng bạn với từ này. Không cần hoàn hảo.
          </p>

          <div className="target-word">
            <strong>{sentenceWord.word}</strong>
            <span>{sentenceWord.meaning}</span>
          </div>

          <textarea
            className="sentence-input"
            value={sentence}
            disabled={sentenceChecked}
            onChange={(event) => setSentence(event.target.value)}
            placeholder={"Write one sentence with \"" + sentenceWord.word + "\"…"}
            rows={4}
          />

          {!sentenceChecked ? (
            <button
              className="primary-button practice-check"
              disabled={sentence.trim().length < 4}
              onClick={checkSentence}
            >
              Kiểm tra câu của tôi
            </button>
          ) : (
            <div className="sentence-review">
              <div className="sentence-sample">
                <span>Ví dụ tham khảo</span>
                <strong>{sentenceWord.example}</strong>
              </div>
              <p>Câu của bạn có dùng đúng ý và đúng ngữ cảnh không?</p>
              <div className="practice-rating">
                <button
                  className={sentenceRated === true ? "active" : ""}
                  disabled={sentenceRated !== null}
                  onClick={() => rateSentence(true)}
                >
                  ✓ Nhớ được
                </button>
                <button
                  className={sentenceRated === false ? "active" : ""}
                  disabled={sentenceRated !== null}
                  onClick={() => rateSentence(false)}
                >
                  ↻ Chưa chắc
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
