"use client";

import { useMemo, useState } from "react";
import { ARTICLES_BY_ID } from "@/lib/articles";

type Props = {
  today: string;
  assignments: Record<string, string>;
  readDates: string[];
  onMarkRead: (date: string) => void;
};

function formatArticleDate(dateKey: string) {
  const parts = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(parts[0], parts[1] - 1, parts[2]));
}

export default function DailyArticleExperience({
  today,
  assignments,
  readDates,
  onMarkRead
}: Props) {
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const history = useMemo(
    () =>
      Object.entries(assignments)
        .filter(([, articleId]) => Boolean(ARTICLES_BY_ID[articleId]))
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)),
    [assignments]
  );

  const todayArticleId = assignments[today];
  const todayArticle = todayArticleId ? ARTICLES_BY_ID[todayArticleId] : null;
  const activeArticleId = activeDate ? assignments[activeDate] : null;
  const activeArticle = activeArticleId ? ARTICLES_BY_ID[activeArticleId] : null;
  const activeRead = activeDate ? readDates.includes(activeDate) : false;

  if (!todayArticle) return null;

  return (
    <section className="daily-reading-section" id="daily-reading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ONE IDEA A DAY</span>
          <h2>Bài đọc hôm nay</h2>
        </div>
        <span className="reading-count">{readDates.length} bài đã đọc</span>
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
            <button
              className="primary-button"
              onClick={() => setActiveDate(today)}
            >
              {readDates.includes(today) ? "Đọc lại bài hôm nay" : "Đọc bài hôm nay"} →
            </button>
            {readDates.includes(today) && <span className="read-status">✓ Đã đọc</span>}
          </div>
        </div>
        <div className="article-number">
          <small>DAILY</small>
          <strong>01</strong>
          <span>{todayArticle.category}</span>
        </div>
      </article>

      <div className="article-library-head">
        <div>
          <span className="eyebrow">READING LIBRARY</span>
          <h3>Đọc lại bất cứ lúc nào</h3>
        </div>
        <p>Mỗi ngày bạn ghé FastEnglish, bài của ngày đó sẽ được giữ lại trên trình duyệt.</p>
      </div>

      <div className="article-history">
        {history.map(([date, articleId]) => {
          const article = ARTICLES_BY_ID[articleId];
          const isRead = readDates.includes(date);
          return (
            <button
              className={"article-history-card " + (activeDate === date ? "active" : "")}
              key={date}
              onClick={() => setActiveDate(date)}
            >
              <span className="article-history-date">{formatArticleDate(date)}</span>
              <strong>{article.title}</strong>
              <div>
                <span>{article.level} • {article.minutes} min</span>
                <span>{isRead ? "✓ Đã đọc" : "Chưa đọc"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeDate && activeArticle && (
        <article className="article-reader" id="article-reader">
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

          <div className="reader-layout">
            <div className="article-body">
              {activeArticle.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <aside className="article-notes">
              <div className="note-block">
                <span className="note-label">KEY IDEAS</span>
                <ul>
                  {activeArticle.keyIdeas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              </div>

              <div className="note-block">
                <span className="note-label">WORDS TO NOTICE</span>
                <div className="article-vocab">
                  {activeArticle.vocabulary.map((item) => (
                    <div key={item.word}>
                      <strong>{item.word}</strong>
                      <span>{item.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="reader-finish">
            <div>
              <strong>{activeRead ? "Bài này đã nằm trong lịch sử đọc ✓" : "Đọc xong rồi?"}</strong>
              <span>Đánh dấu để theo dõi số bài bạn đã hoàn thành.</span>
            </div>
            <button
              className="primary-button"
              disabled={activeRead}
              onClick={() => onMarkRead(activeDate)}
            >
              {activeRead ? "Đã đọc" : "Đánh dấu đã đọc"}
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
