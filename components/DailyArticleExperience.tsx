"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ARTICLES_BY_ID } from "@/lib/articles";
import { WORDS } from "@/lib/words";
import ReadingLearningTools from "@/components/ReadingLearningTools";

type Props = {
  today: string;
  assignments: Record<string, string>;
  readDates: string[];
  onMarkRead: (date: string) => void;
};

type MarkerColor = "yellow" | "mint" | "rose" | "blue";
type ReaderTheme = "paper" | "sepia" | "night";
type SavedMarker = {
  id: string;
  articleId: string;
  paragraphIndex: number;
  start: number;
  end: number;
  text: string;
  color: MarkerColor;
  note: string;
  savedAt: string;
};
type ReaderSettings = { theme: ReaderTheme; textSize: number };
type DictionaryEntry = { ipa: string; definition: string; partOfSpeech: string };
type SelectionDraft = {
  paragraphIndex: number;
  start: number;
  end: number;
  text: string;
  left: number;
  top: number;
};

const NOTES_STORAGE_KEY = "fastenglish-reader-highlights-v1";
const SETTINGS_STORAGE_KEY = "fastenglish-reader-settings-v1";
const COLORS: { key: MarkerColor; label: string }[] = [
  { key: "yellow", label: "Vàng" },
  { key: "mint", label: "Xanh lá" },
  { key: "rose", label: "Hồng" },
  { key: "blue", label: "Xanh dương" }
];

function formatArticleDate(dateKey: string) {
  const parts = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  }).format(new Date(parts[0], parts[1] - 1, parts[2]));
}

function sayEnglish(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 0.86;
  window.speechSynthesis.speak(speech);
}

function validMarker(value: unknown): value is SavedMarker {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<SavedMarker>;
  return (
    typeof entry.id === "string" &&
    typeof entry.articleId === "string" &&
    typeof entry.paragraphIndex === "number" &&
    Number.isInteger(entry.paragraphIndex) &&
    typeof entry.start === "number" &&
    typeof entry.end === "number" &&
    entry.start >= 0 &&
    entry.end > entry.start &&
    typeof entry.text === "string" &&
    ["yellow", "mint", "rose", "blue"].includes(String(entry.color))
  );
}

function renderMarkedParagraph(paragraph: string, markers: SavedMarker[], onFocus: (id: string) => void) {
  const ordered = [...markers].sort((a, b) => a.start - b.start);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const marker of ordered) {
    if (marker.start < cursor || marker.end > paragraph.length) continue;
    if (marker.start > cursor) parts.push(paragraph.slice(cursor, marker.start));
    parts.push(
      <mark
        key={marker.id}
        className={"reader-highlight highlight-" + marker.color}
        title="Xem ghi chú đã lưu"
        onClick={() => onFocus(marker.id)}
      >
        {paragraph.slice(marker.start, marker.end)}
      </mark>
    );
    cursor = marker.end;
  }
  parts.push(paragraph.slice(cursor));
  return parts;
}

export default function DailyArticleExperience({
  today, assignments, readDates, onMarkRead
}: Props) {
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [markers, setMarkers] = useState<SavedMarker[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>({ theme: "paper", textSize: 19 });
  const [ready, setReady] = useState(false);
  const [selectionDraft, setSelectionDraft] = useState<SelectionDraft | null>(null);
  const [dictionary, setDictionary] = useState<DictionaryEntry | null>(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [focusedMarker, setFocusedMarker] = useState<string | null>(null);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const articleBodyRef = useRef<HTMLDivElement>(null);
  const notebookRef = useRef<HTMLDivElement>(null);

  const history = useMemo(
    () => Object.entries(assignments)
      .filter(([, id]) => Boolean(ARTICLES_BY_ID[id]))
      .sort(([a], [b]) => b.localeCompare(a)),
    [assignments]
  );

  const todayArticle = ARTICLES_BY_ID[assignments[today]];
  const activeArticle = activeDate ? ARTICLES_BY_ID[assignments[activeDate]] : null;
  const activeRead = activeDate ? readDates.includes(activeDate) : false;
  const currentMarkers = useMemo(
    () => markers.filter((marker) => marker.articleId === activeArticle?.id),
    [markers, activeArticle?.id]
  );
  const visibleMarkers = showAllNotes ? [...markers].reverse() : [...currentMarkers].reverse();

  useEffect(() => {
    try {
      const rawNotes = window.localStorage.getItem(NOTES_STORAGE_KEY);
      if (rawNotes) {
        const parsed: unknown = JSON.parse(rawNotes);
        if (Array.isArray(parsed)) {
          setMarkers(parsed.filter(validMarker).map((item: SavedMarker) => ({
            ...item, note: typeof item.note === "string" ? item.note : ""
          })));
        }
      }
      const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings) as Partial<ReaderSettings>;
        if (["paper", "sepia", "night"].includes(String(parsed.theme))) {
          setSettings({
            theme: parsed.theme as ReaderTheme,
            textSize: Math.max(16, Math.min(26, Number(parsed.textSize) || 19))
          });
        }
      }
    } catch {
      // An invalid storage entry should never block reading.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(markers)); } catch {}
  }, [markers, ready]);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings, ready]);

  useEffect(() => {
    setSelectionDraft(null);
    setFocusedMarker(null);
  }, [activeDate]);

  useEffect(() => {
    const term = selectionDraft?.text.trim() || "";
    setDictionary(null);
    if (!term || !/^[a-z][a-z' -]{0,43}$/i.test(term) || term.split(/\s+/).length > 2) {
      setDictionaryLoading(false);
      return;
    }
    const controller = new AbortController();
    setDictionaryLoading(true);
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(term), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data: unknown) => {
        if (!Array.isArray(data) || !data[0]) return;
        const result = data[0] as {
          phonetic?: string;
          phonetics?: Array<{ text?: string }>;
          meanings?: Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string }> }>;
        };
        setDictionary({
          ipa: result.phonetic || result.phonetics?.find((entry) => entry.text)?.text || "",
          definition: result.meanings?.[0]?.definitions?.[0]?.definition || "",
          partOfSpeech: result.meanings?.[0]?.partOfSpeech || ""
        });
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setDictionaryLoading(false); });
    return () => controller.abort();
  }, [selectionDraft?.text]);

  function openArticle(date: string) {
    setActiveDate(date);
    setShowAllNotes(false);
    window.setTimeout(() => {
      document.getElementById("article-reader")?.scrollIntoView({
        behavior: "smooth", block: "start"
      });
    }, 20);
  }

  function captureSelection() {
    const selection = window.getSelection();
    const root = articleBodyRef.current;
    if (!selection || selection.isCollapsed || !root || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return;

    const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer as Element : range.startContainer.parentElement;
    const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE
      ? range.endContainer as Element : range.endContainer.parentElement;
    const startParagraph = startElement?.closest<HTMLElement>("[data-paragraph-index]");
    const endParagraph = endElement?.closest<HTMLElement>("[data-paragraph-index]");
    if (!startParagraph || startParagraph !== endParagraph) {
      setSelectionDraft(null);
      return;
    }

    const beginning = range.cloneRange();
    beginning.selectNodeContents(startParagraph);
    beginning.setEnd(range.startContainer, range.startOffset);
    const finish = range.cloneRange();
    finish.selectNodeContents(startParagraph);
    finish.setEnd(range.endContainer, range.endOffset);

    let start = beginning.toString().length;
    let end = finish.toString().length;
    const raw = startParagraph.textContent?.slice(start, end) ?? "";
    const leftTrim = raw.length - raw.trimStart().length;
    const rightTrim = raw.length - raw.trimEnd().length;
    start += leftTrim;
    end -= rightTrim;
    if (start >= end || end - start > 420) {
      setSelectionDraft(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    setSelectionDraft({
      paragraphIndex: Number(startParagraph.dataset.paragraphIndex),
      start, end,
      text: startParagraph.textContent?.slice(start, end) ?? "",
      left: Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2)),
      top: Math.max(70, Math.min(window.innerHeight - 100, rect.top - 74))
    });
  }

  function saveSelection(color: MarkerColor) {
    if (!selectionDraft || !activeArticle) return;
    const draft = selectionDraft;
    const nextMarker: SavedMarker = {
      id: "mark-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      articleId: activeArticle.id,
      paragraphIndex: draft.paragraphIndex,
      start: draft.start, end: draft.end,
      text: draft.text, color, note: "", savedAt: new Date().toISOString()
    };
    setMarkers((previous) => [
      ...previous.filter((marker) =>
        marker.articleId !== nextMarker.articleId ||
        marker.paragraphIndex !== nextMarker.paragraphIndex ||
        marker.end <= nextMarker.start ||
        marker.start >= nextMarker.end
      ),
      nextMarker
    ]);
    setFocusedMarker(nextMarker.id);
    setSelectionDraft(null);
    window.getSelection()?.removeAllRanges();
  }

  function saveVocabulary(word: string) {
    if (!activeArticle) return;
    const needle = word.toLocaleLowerCase("en");
    const paragraphIndex = activeArticle.paragraphs.findIndex((part) =>
      part.toLocaleLowerCase("en").includes(needle)
    );
    // Some glossary words are conceptual labels or a different word form.
    // They should still be saveable even when no exact occurrence exists.
    const start = paragraphIndex < 0 ? 0 :
      activeArticle.paragraphs[paragraphIndex].toLocaleLowerCase("en").indexOf(needle);
    const end = start + word.length;
    const existing = markers.find((marker) =>
      marker.articleId === activeArticle.id &&
      marker.paragraphIndex === paragraphIndex &&
      marker.start === start && marker.end === end
    );
    if (existing) {
      setFocusedMarker(existing.id);
      notebookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    const marker: SavedMarker = {
      id: "mark-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      articleId: activeArticle.id, paragraphIndex, start, end,
      text: paragraphIndex < 0 ? word :
        activeArticle.paragraphs[paragraphIndex].slice(start, end),
      color: "yellow", note: "", savedAt: new Date().toISOString()
    };
    setMarkers((previous) => [
      ...previous.filter((item) =>
        item.articleId !== marker.articleId ||
        item.paragraphIndex !== paragraphIndex ||
        item.end <= start || item.start >= end
      ), marker
    ]);
    setFocusedMarker(marker.id);
  }

  function editMarker(id: string, patch: Partial<Pick<SavedMarker, "note" | "color">>) {
    setMarkers((previous) => previous.map((marker) =>
      marker.id === id ? { ...marker, ...patch } : marker
    ));
  }

  function removeMarker(id: string) {
    setMarkers((previous) => previous.filter((marker) => marker.id !== id));
    if (focusedMarker === id) setFocusedMarker(null);
  }

  function focusMarker(id: string) {
    setFocusedMarker(id);
    notebookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function getMeaning(word: string, articleId: string) {
    const normalized = word.trim().toLocaleLowerCase("en");
    const fromArticle = ARTICLES_BY_ID[articleId]?.vocabulary.find(
      (entry) => entry.word.toLocaleLowerCase("en") === normalized
    );
    return fromArticle?.meaning ??
      WORDS.find((entry) => entry.word.toLocaleLowerCase("en") === normalized)?.meaning ??
      "";
  }

  if (!todayArticle) return null;

  return (
    <section className="daily-reading-section" id="daily-reading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">READ • HIGHLIGHT • REMEMBER</span>
          <h2>Đọc một chút, hiểu sâu hơn.</h2>
          <p className="reading-section-subtitle">Đọc bài tiếng Anh B2–C2, bôi chọn từ hoặc cụm từ để tô màu và lưu vào sổ tay.</p>
        </div>
        <span className="reading-count">{readDates.length} bài đã đọc · {markers.length} ghi chú</span>
      </div>

      <article className="article-feature">
        <div className="article-feature-copy">
          <div className="article-meta">
            <span>{todayArticle.kicker}</span>
            <span>{todayArticle.level}</span>
            <span>{todayArticle.minutes} phút đọc</span>
          </div>
          <h3>{todayArticle.title}</h3>
          <p>{todayArticle.summary}</p>
          <div className="article-actions">
            <button className="primary-button" onClick={() => openArticle(today)}>
              {readDates.includes(today) ? "Đọc lại bài hôm nay" : "Bắt đầu đọc"} →
            </button>
            {readDates.includes(today) && <span className="read-status">✓ Đã đọc</span>}
          </div>
        </div>
        <div className="article-number">
          <small>EDITOR&apos;S PICK</small>
          <strong>01</strong>
          <span>{todayArticle.category}</span>
        </div>
      </article>

      <div className="article-library-head">
        <div>
          <span className="eyebrow">YOUR READING LIBRARY</span>
          <h3>Thư viện bài đọc</h3>
        </div>
        <p>Bài đọc từng ngày được giữ lại. Từ đã tô màu và ghi chú cũng sẽ còn khi bạn quay lại.</p>
      </div>

      <div className="article-history">
        {history.map(([date, articleId]) => {
          const article = ARTICLES_BY_ID[articleId];
          const isRead = readDates.includes(date);
          const savedCount = markers.filter((item) => item.articleId === article.id).length;
          return (
            <button
              className={"article-history-card " + (activeDate === date ? "active" : "")}
              key={date} onClick={() => openArticle(date)}
            >
              <span className="article-history-date">{formatArticleDate(date)}</span>
              <strong>{article.title}</strong>
              <div>
                <span>{article.level} • {article.minutes} phút</span>
                <span>{isRead ? "✓ Đã đọc" : "Chưa đọc"}</span>
              </div>
              {savedCount > 0 && <small className="saved-count">✦ {savedCount} phần đã lưu</small>}
            </button>
          );
        })}
      </div>

      {activeDate && activeArticle && (
        <article className={"article-reader reader-theme-" + settings.theme} id="article-reader">
          <header>
            <div>
              <span className="eyebrow">{activeArticle.kicker}</span>
              <h2>{activeArticle.title}</h2>
              <p className="article-deck">{activeArticle.summary}</p>
            </div>
            <div className="reader-meta">
              <span>{formatArticleDate(activeDate)}</span>
              <span>{activeArticle.level}</span>
              <span>~{activeArticle.minutes} phút</span>
            </div>
          </header>

          <div className="reader-control-bar" aria-label="Công cụ đọc">
            <div className="reader-control-group">
              <span className="reader-control-label">Cỡ chữ</span>
              <button aria-label="Giảm cỡ chữ" disabled={settings.textSize <= 16}
                onClick={() => setSettings((s) => ({ ...s, textSize: Math.max(16, s.textSize - 1) }))}>A−</button>
              <strong>{settings.textSize}px</strong>
              <button aria-label="Tăng cỡ chữ" disabled={settings.textSize >= 26}
                onClick={() => setSettings((s) => ({ ...s, textSize: Math.min(26, s.textSize + 1) }))}>A+</button>
            </div>
            <div className="reader-control-group">
              <span className="reader-control-label">Nền đọc</span>
              {([["paper", "Sáng"], ["sepia", "Kem"], ["night", "Tối"]] as const).map(([theme, label]) => (
                <button key={theme} className={settings.theme === theme ? "chosen" : ""}
                  aria-pressed={settings.theme === theme}
                  onClick={() => setSettings((s) => ({ ...s, theme }))}>{label}</button>
              ))}
            </div>
          </div>

          <div className="reader-tip">
            <span aria-hidden="true">✦</span>
            <span><strong>Mẹo học:</strong> Bôi đen bằng chuột hoặc nhấn giữ trên điện thoại, sau đó chọn màu để lưu từ/cụm từ. Có thể thêm nghĩa và ghi chú ở sổ tay.</span>
          </div>

          <div className="reader-layout">
            <div
              className="article-body article-body-interactive"
              ref={articleBodyRef}
              style={{ fontSize: settings.textSize + "px" }}
              onMouseUp={captureSelection}
              onKeyUp={captureSelection}
              onTouchEnd={() => window.setTimeout(captureSelection, 140)}
            >
              {activeArticle.paragraphs.map((paragraph, index) => (
                <p data-paragraph-index={index} key={index}>
                  {renderMarkedParagraph(
                    paragraph,
                    currentMarkers.filter((marker) => marker.paragraphIndex === index),
                    focusMarker
                  )}
                </p>
              ))}
            </div>

            <aside className="article-notes">
              <div className="note-block">
                <span className="note-label">KEY IDEAS</span>
                <ul>{activeArticle.keyIdeas.map((idea) => <li key={idea}>{idea}</li>)}</ul>
              </div>
              <div className="note-block">
                <span className="note-label">WORDS TO NOTICE</span>
                <div className="article-vocab">
                  {activeArticle.vocabulary.map((item) => (
                    <div className="vocab-save-row" key={item.word}>
                      <div><strong>{item.word}</strong><span>{item.meaning}</span></div>
                      <button title={"Lưu từ " + item.word}
                        aria-label={"Lưu từ " + item.word}
                        onClick={() => saveVocabulary(item.word)}>＋</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="note-block note-summary">
                <span className="note-label">YOUR COLLECTION</span>
                <strong>{currentMarkers.length} phần đã lưu</strong>
                <p>Từ vựng, cụm từ và những ý bạn thấy đáng nhớ.</p>
                <button onClick={() => notebookRef.current?.scrollIntoView({ behavior: "smooth" })}>
                  Mở sổ tay ↓
                </button>
              </div>
            </aside>
          </div>

          <div className="reading-notebook" ref={notebookRef} id="reading-notebook">
            <div className="notebook-heading">
              <div>
                <span className="eyebrow">MY READING NOTEBOOK</span>
                <h3>Sổ tay highlight</h3>
                <p>Chọn màu, thêm nghĩa hoặc ví dụ riêng. Ghi chú tự động lưu trên thiết bị này.</p>
              </div>
              <div className="notebook-switch">
                <button className={!showAllNotes ? "active" : ""}
                  onClick={() => setShowAllNotes(false)}>Bài này ({currentMarkers.length})</button>
                <button className={showAllNotes ? "active" : ""}
                  onClick={() => setShowAllNotes(true)}>Tất cả ({markers.length})</button>
              </div>
            </div>

            {visibleMarkers.length === 0 ? (
              <div className="notebook-empty">
                <span>✎</span>
                <strong>Chưa có phần nào được lưu</strong>
                <p>Thử bôi đen một từ hoặc cụm từ trong bài đọc, rồi chọn màu highlight nhé.</p>
              </div>
            ) : (
              <div className="notebook-grid">
                {visibleMarkers.map((marker) => {
                  const meaning = getMeaning(marker.text, marker.articleId);
                  const sourceArticle = ARTICLES_BY_ID[marker.articleId];
                  return (
                    <section className={"notebook-card " + (focusedMarker === marker.id ? "focused" : "")}
                      key={marker.id}>
                      <div className="notebook-card-top">
                        <span className={"notebook-color-bar highlight-" + marker.color} />
                        <span>{sourceArticle?.title || "Bài đọc"}</span>
                        <button aria-label={"Xóa " + marker.text} title="Bỏ lưu"
                          onClick={() => removeMarker(marker.id)}>✕</button>
                      </div>
                      <div className="notebook-word-row">
                        <strong>{marker.text}</strong>
                        <button aria-label={"Nghe phát âm " + marker.text}
                          onClick={() => sayEnglish(marker.text)}>◖))</button>
                      </div>
                      {meaning && <span className="notebook-meaning">Gợi ý nghĩa: {meaning}</span>}
                      <a className="notebook-translate" target="_blank" rel="noopener noreferrer"
                        href={"https://translate.google.com/?sl=en&tl=vi&op=translate&text=" + encodeURIComponent(marker.text)}>
                        Tra nghĩa chi tiết ↗
                      </a>
                      <p className="notebook-context">{sourceArticle?.paragraphs[marker.paragraphIndex]?.slice(
                        Math.max(0, marker.start - 75),
                        Math.min(sourceArticle.paragraphs[marker.paragraphIndex].length, marker.end + 75)
                      )}</p>
                      <div className="notebook-colors" aria-label="Đổi màu highlight">
                        {COLORS.map((color) => (
                          <button key={color.key}
                            title={color.label}
                            aria-label={"Đổi sang màu " + color.label}
                            aria-pressed={marker.color === color.key}
                            className={"color-dot highlight-" + color.key + (marker.color === color.key ? " active" : "")}
                            onClick={() => editMarker(marker.id, { color: color.key })} />
                        ))}
                      </div>
                      <label htmlFor={"note-" + marker.id}>Ghi chú / nghĩa của bạn</label>
                      <textarea id={"note-" + marker.id} rows={2}
                        placeholder="Ví dụ: nghĩa trong ngữ cảnh, cách dùng, câu của bạn…"
                        value={marker.note}
                        onChange={(event) => editMarker(marker.id, { note: event.target.value })} />
                      {showAllNotes && sourceArticle && sourceArticle.id !== activeArticle.id && (
                        <button className="notebook-jump" onClick={() => {
                          const date = history.find(([, articleId]) => articleId === marker.articleId)?.[0];
                          if (date) openArticle(date);
                        }}>Mở bài đọc này ↗</button>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          <ReadingLearningTools article={activeArticle} markers={markers} />

          <div className="reader-finish">
            <div>
              <strong>{activeRead ? "Bài này đã nằm trong lịch sử đọc ✓" : "Đọc xong rồi?"}</strong>
              <span>Hoàn thành để theo dõi tiến độ. Những từ bạn tô màu vẫn được giữ lại.</span>
            </div>
            <button className="primary-button" disabled={activeRead}
              onClick={() => onMarkRead(activeDate)}>
              {activeRead ? "Đã đọc" : "Đánh dấu đã đọc"}
            </button>
          </div>
        </article>
      )}

      {selectionDraft && activeArticle && (
        <div className="selection-toolbar" role="toolbar" aria-label="Lưu đoạn đã chọn"
          style={{ left: selectionDraft.left, top: selectionDraft.top }}>
          <div className="selection-toolbar-title">Lưu: “{selectionDraft.text.slice(0, 32)}{selectionDraft.text.length > 32 ? "…" : ""}”</div>
          <div className="selection-dictionary">
            {getMeaning(selectionDraft.text, activeArticle.id) && (
              <div className="selection-hint"><strong>Nghĩa:</strong> {getMeaning(selectionDraft.text, activeArticle.id)}</div>
            )}
            {dictionary?.ipa && <span className="selection-ipa">{dictionary.ipa}</span>}
            {dictionary?.definition && <div className="selection-dict-definition"><span>{dictionary.partOfSpeech}</span> {dictionary.definition}</div>}
            {!dictionary?.definition && dictionaryLoading && <small>Đang tra từ điển…</small>}
            <div className="selection-dictionary-actions">
              <button onMouseDown={(event) => event.preventDefault()}
                onClick={() => sayEnglish(selectionDraft.text)}>◖)) Nghe</button>
              <a target="_blank" rel="noopener noreferrer"
                href={"https://translate.google.com/?sl=en&tl=vi&op=translate&text=" + encodeURIComponent(selectionDraft.text)}>
                Tra nghĩa ↗
              </a>
            </div>
          </div>
          <div className="selection-toolbar-actions">
            {COLORS.map((color) => (
              <button key={color.key}
                className={"color-dot highlight-" + color.key}
                aria-label={"Tô màu " + color.label + " và lưu"}
                title={"Tô " + color.label + " và lưu"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => saveSelection(color.key)} />
            ))}
            <button className="selection-cancel" aria-label="Hủy chọn"
              onClick={() => { setSelectionDraft(null); window.getSelection()?.removeAllRanges(); }}>✕</button>
          </div>
        </div>
      )}
    </section>
  );
}
