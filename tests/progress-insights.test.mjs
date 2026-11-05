import assert from "node:assert/strict";
import { test } from "node:test";
import { buildLearningInsights } from "../lib/progress-insights.ts";
const WORDS = [{ id: "b2-allocate", word: "allocate", level: "B2" }];
const byId = Object.fromEntries(WORDS.map(word => [word.id, word]));

const id = WORDS[0].id;

test("summarizes a seven-day window without inventing scores", () => {
  const insight = buildLearningInsights({
    completedDates: ["2026-11-04", "2026-11-05"],
    practiceDates: ["2026-11-04", "2026-11-05"],
    dailyPractice: {
      "2026-11-04": { score: 2, total: 2 },
      "2026-11-05": { score: 1, total: 2 }
    },
    review: { [id]: { nextReviewDate: "2026-11-01", correctCount: 1, wrongCount: 2 } }
  }, "2026-11-05", byId);
  assert.equal(insight.activity.length, 14);
  assert.equal(insight.studied7, 2);
  assert.equal(insight.practiced7, 2);
  assert.equal(insight.accuracy7, 75);
  assert.equal(insight.dueCount, 1);
  assert.equal(insight.weak[0].word, WORDS[0].word);
});

test("empty progress has no review accuracy and no due cards", () => {
  const result = buildLearningInsights({
    completedDates: [], practiceDates: [], dailyPractice: {}, review: {}
  }, "2026-11-05", byId);
  assert.equal(result.accuracy7, null);
  assert.deepEqual(result.upcoming, []);
  assert.equal(result.activity[0].date, "2026-10-23");
});

test("ignores unknown vocabulary identifiers and future reviews", () => {
  const insight = buildLearningInsights({
    completedDates: [], practiceDates: [], dailyPractice: {},
    review: {
      "unknown-id": { nextReviewDate: "2026-11-01", correctCount: 0, wrongCount: 50 },
      [id]: { nextReviewDate: "2026-11-20", correctCount: 10, wrongCount: 0 }
    }
  }, "2026-11-05", byId);
  assert.equal(insight.dueCount, 0);
  assert.deepEqual(insight.weak, []);
});
