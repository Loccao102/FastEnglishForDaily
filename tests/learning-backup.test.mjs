import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEARNING_KEYS, makeLearningBackup, parseLearningBackup, restoreLearningBackup
} from "../lib/learning-backup.ts";

function store() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
}
const progress = {
  version: 3, completedDates: ["2026-11-01"], dailyPlans: {}, learned: {}, review: {}, quizResults: []
};
const marker = {
  id: "mark-1", articleId: "article-1", paragraphIndex: 0, start: 0, end: 4,
  text: "word", color: "mint", note: "nghĩa", savedAt: "2026-11-01"
};

test("backup and restore all learning stores with Unicode notes", () => {
  const source = store();
  source.setItem(LEARNING_KEYS[0], JSON.stringify(progress));
  source.setItem(LEARNING_KEYS[1], JSON.stringify([marker]));
  source.setItem(LEARNING_KEYS[2], JSON.stringify({ theme: "paper", textSize: 19 }));
  source.setItem(LEARNING_KEYS[3], JSON.stringify({ "mark-1": { level: 1, due: "2026-11-06", reviewed: 1, lastReviewed: null } }));
  const backup = makeLearningBackup(source, new Date("2026-11-05T00:00:00Z"));
  assert.equal(Object.keys(parseLearningBackup(backup)).length, 4);
  const target = store();
  restoreLearningBackup(target, backup);
  assert.deepEqual(JSON.parse(target.getItem(LEARNING_KEYS[1])), [marker]);
  assert.deepEqual(JSON.parse(target.getItem(LEARNING_KEYS[0])), progress);
});

test("missing entries are preserved as null and cleared on restore", () => {
  const backup = makeLearningBackup(store());
  const target = store();
  target.setItem(LEARNING_KEYS[0], JSON.stringify(progress));
  restoreLearningBackup(target, backup);
  assert.equal(target.getItem(LEARNING_KEYS[0]), null);
});

test("tampered or oversized backups are rejected without touching data", () => {
  const target = store();
  target.setItem(LEARNING_KEYS[0], JSON.stringify(progress));
  assert.throws(() => restoreLearningBackup(target, "not-json"), /JSON/);
  assert.throws(() => parseLearningBackup("x".repeat(5 * 1024 * 1024 + 1)), /5MB/);
  const corrupted = JSON.parse(makeLearningBackup(store()));
  corrupted.data[LEARNING_KEYS[1]] = [{ id: "bad", text: "malformed" }];
  assert.throws(() => restoreLearningBackup(target, JSON.stringify(corrupted)), /không hợp lệ/);
  assert.deepEqual(JSON.parse(target.getItem(LEARNING_KEYS[0])), progress);
});
