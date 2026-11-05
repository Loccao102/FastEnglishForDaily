/** A portable snapshot of the four browser-local learning stores. No network calls. */
export const LEARNING_KEYS = [
  "fastenglish-progress-v1",
  "fastenglish-reader-highlights-v1",
  "fastenglish-reader-settings-v1",
  "fastenglish-reading-flashcards-v1"
] as const;
type LearningKey = typeof LEARNING_KEYS[number];
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const MAX_BYTES = 5 * 1024 * 1024;
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const validDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

function validEntry(key: LearningKey, value: unknown): boolean {
  if (value === null) return true;
  if (key === "fastenglish-progress-v1") {
    return record(value) && value.version === 3 &&
      Array.isArray(value.completedDates) && value.completedDates.every(validDate) &&
      record(value.dailyPlans) && record(value.learned) && record(value.review) &&
      Array.isArray(value.quizResults);
  }
  if (key === "fastenglish-reader-highlights-v1") {
    return Array.isArray(value) && value.length <= 20000 && value.every(marker =>
      record(marker) && typeof marker.id === "string" && typeof marker.articleId === "string" &&
      Number.isInteger(marker.paragraphIndex) && typeof marker.start === "number" &&
      typeof marker.end === "number" && marker.start >= 0 && marker.end > marker.start &&
      typeof marker.text === "string" && ["yellow","mint","rose","blue"].includes(String(marker.color))
    );
  }
  if (key === "fastenglish-reader-settings-v1") {
    return record(value) && ["paper","sepia","night"].includes(String(value.theme)) &&
      typeof value.textSize === "number" && Number.isFinite(value.textSize) &&
      value.textSize >= 16 && value.textSize <= 26;
  }
  return record(value) && Object.keys(value).length <= 20000 &&
    Object.values(value).every(card => record(card) &&
      Number.isInteger(card.level) && typeof card.level === "number" &&
      card.level >= 0 && card.level <= 5 &&
      validDate(card.due) && Number.isInteger(card.reviewed) &&
      (card.lastReviewed === null || validDate(card.lastReviewed)));
}

function checkSize(raw: string): void {
  if (new TextEncoder().encode(raw).byteLength > MAX_BYTES) {
    throw new Error("Bản sao lưu vượt quá 5MB.");
  }
}

export function makeLearningBackup(store: Pick<Store, "getItem">, now = new Date()): string {
  const data = {} as Record<LearningKey, unknown>;
  for (const key of LEARNING_KEYS) {
    const raw = store.getItem(key);
    try {
      data[key] = raw === null ? null : JSON.parse(raw);
    } catch {
      throw new Error("Không đọc được dữ liệu " + key + ". Hãy kiểm tra bộ nhớ trình duyệt.");
    }
    if (!validEntry(key, data[key])) {
      throw new Error("Dữ liệu " + key + " không đúng định dạng.");
    }
  }
  const output = JSON.stringify({
    format: "fastenglish-learning-backup", version: 1, exportedAt: now.toISOString(), data
  }, null, 2);
  checkSize(output);
  return output;
}

export function parseLearningBackup(raw: string): Record<LearningKey, string | null> {
  checkSize(raw);
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("File JSON không hợp lệ."); }
  if (!record(parsed) || parsed.format !== "fastenglish-learning-backup" ||
      parsed.version !== 1 || !record(parsed.data)) {
    throw new Error("Đây không phải bản sao lưu FastEnglish được hỗ trợ.");
  }
  const data = parsed.data;
  if (Object.keys(data).length !== LEARNING_KEYS.length) {
    throw new Error("Bản sao lưu thiếu dữ liệu hoặc có mục không hợp lệ.");
  }
  const result = {} as Record<LearningKey, string | null>;
  for (const key of LEARNING_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(data, key) || !validEntry(key, data[key])) {
      throw new Error("Dữ liệu " + key + " trong bản sao lưu không hợp lệ.");
    }
    result[key] = data[key] === null ? null : JSON.stringify(data[key]);
  }
  return result;
}

/** Validate everything before writing; best-effort rollback on quota failures. */
export function restoreLearningBackup(store: Store, raw: string): void {
  const imported = parseLearningBackup(raw);
  const previous = {} as Record<LearningKey, string | null>;
  for (const key of LEARNING_KEYS) previous[key] = store.getItem(key);
  try {
    for (const key of LEARNING_KEYS) {
      if (imported[key] === null) store.removeItem(key);
      else store.setItem(key, imported[key]!);
    }
  } catch {
    for (const key of LEARNING_KEYS) {
      try {
        if (previous[key] === null) store.removeItem(key);
        else store.setItem(key, previous[key]!);
      } catch { /* Browser storage may be unavailable. */ }
    }
    throw new Error("Bộ nhớ trình duyệt không đủ hoặc không cho phép khôi phục.");
  }
}
