"use client";

import { useEffect, useMemo, useState } from "react";
import { WORDS_BY_ID } from "@/lib/words";
import {
  applyReviewResult, dueReviewIds, isReviewState, localStudyDate,
  type ReviewState
} from "@/lib/review-schedule";

const STORAGE_KEY="fastenglish-progress-v1";
const KNOWN_WORDS=new Set(Object.keys(WORDS_BY_ID));

function storedProgress():Record<string,unknown>|null{
  const raw=window.localStorage.getItem(STORAGE_KEY);
  if(!raw)return null;
  const data:unknown=JSON.parse(raw);
  if(!data||typeof data!=="object"||Array.isArray(data)||
    (data as {version?:unknown}).version!==3)
    throw new Error("Dữ liệu học trên thiết bị không đúng định dạng.");
  return data as Record<string,unknown>;
}

function readReviews(input:unknown):Record<string,ReviewState>{
  if(!input||typeof input!=="object"||Array.isArray(input))return {};
  return Object.fromEntries(Object.entries(input).filter(([,value])=>isReviewState(value))) as Record<string,ReviewState>;
}

function pronounce(word:string){
  if(!("speechSynthesis" in window))return;
  window.speechSynthesis.cancel();
  const speech=new SpeechSynthesisUtterance(word);
  speech.lang="en-US";speech.rate=0.86;
  window.speechSynthesis.speak(speech);
}

export default function ReviewCenter(){
  const [today]=useState(()=>localStudyDate());
  const [review,setReview]=useState<Record<string,ReviewState>>({});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [revealed,setRevealed]=useState(false);
  const [reviewed,setReviewed]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [filter,setFilter]=useState<"all"|"B2"|"C1"|"C2">("all");

  useEffect(()=>{
    function refresh(){
      try{
        setReview(readReviews(storedProgress()?.review));
        setError("");
      }catch(err){
        setError(err instanceof Error?err.message:"Không thể đọc dữ liệu ôn tập.");
      }finally{setLoading(false);}
    }
    refresh();
    const onStorage=(event:StorageEvent)=>{
      if(event.key===STORAGE_KEY){refresh();setRevealed(false);}
    };
    window.addEventListener("storage",onStorage);
    return ()=>window.removeEventListener("storage",onStorage);
  },[]);

  const dueIds=useMemo(()=>dueReviewIds(review,KNOWN_WORDS,today),[review,today]);
  const visibleIds=useMemo(()=>dueIds.filter(id=>
    filter==="all"||WORDS_BY_ID[id]?.level===filter
  ),[dueIds,filter]);
  const currentId=visibleIds[0]||null;
  const current=currentId?WORDS_BY_ID[currentId]:null;

  function rate(remembered:boolean){
    if(!currentId)return;
    setError("");
    try{
      const stored=storedProgress();
      if(!stored)throw new Error("Chưa có dữ liệu học để lưu kết quả ôn tập.");
      const rawReview=stored.review && typeof stored.review==="object" && !Array.isArray(stored.review)
        ? stored.review as Record<string,unknown>:{};
      const previous=rawReview[currentId];
      const state=isReviewState(previous)?previous:review[currentId];
      if(!state)throw new Error("Thẻ này không có lịch ôn hợp lệ.");
      // Read the latest version before writing to avoid overwriting another tab's study results.
      const nextReview={...rawReview,[currentId]:applyReviewResult(state,remembered,today)};
      window.localStorage.setItem(STORAGE_KEY,JSON.stringify({...stored,review:nextReview}));
      setReview(readReviews(nextReview));
      setReviewed(n=>n+1);
      if(remembered)setCorrect(n=>n+1);
      setRevealed(false);
    }catch(err){
      setError(err instanceof Error?err.message:"Không thể lưu lần ôn này.");
    }
  }

  return <main className="review-center-page">
    <nav className="review-center-nav"><a href="/" className="review-back">← Bài học hôm nay</a>
      <strong>FastEnglish <span>Review Center</span></strong></nav>
    <section className="review-center-hero">
      <span className="eyebrow">SPACED REPETITION · CATCH-UP</span>
      <h1>Ôn đúng lúc, <em>nhớ lâu hơn.</em></h1>
      <p>Ôn hết các từ vựng đang đến hạn, không bị giới hạn bởi hai bài luyện hằng ngày.
        Lịch ôn được cập nhật trên chính thiết bị này và không làm thay đổi streak.</p>
      <div className="review-center-stats">
        <div><strong>{loading?"—":dueIds.length}</strong><span>Còn đến hạn</span></div>
        <div><strong>{reviewed}</strong><span>Đã ôn phiên này</span></div>
        <div><strong>{reviewed?Math.round(correct/reviewed*100)+"%":"—"}</strong><span>Nhớ được phiên này</span></div>
      </div>
    </section>
    <section className="review-center-content" aria-label="Ôn luyện từ đến hạn">
      {error&&<p className="review-center-error" role="alert">{error}</p>}
      <div className="review-center-toolbar">
        <div><h2>Hàng chờ ôn tập</h2><p>Đánh giá theo khả năng nhớ thật của bạn.</p></div>
        <div className="review-center-filters" aria-label="Lọc cấp độ">
          {(["all","B2","C1","C2"] as const).map(level=>
            <button key={level} type="button" className={filter===level?"active":""}
              onClick={()=>{setFilter(level);setRevealed(false);}}>
              {level==="all"?"Tất cả":level}
            </button>
          )}
        </div>
      </div>
      {loading?<div className="review-center-empty"><p>Đang nạp lịch ôn…</p></div>:
      current?<div className="review-center-card">
        <div className="review-center-card-top"><span>{current.level}</span><span>{visibleIds.length} từ còn trong nhóm</span></div>
        <div className="review-center-prompt">
          <span>HÃY NHỚ LẠI NGHĨA CỦA TỪ</span>
          <h3>{current.word}</h3>
          <button type="button" onClick={()=>pronounce(current.word)}>◖)) Phát âm</button>
          <p>{current.partOfSpeech}</p>
        </div>
        {revealed?<div className="review-center-answer">
          <span>ĐÁP ÁN</span>
          <strong>{current.meaning}</strong>
          <p>{current.definition}</p>
          <blockquote>{current.example}</blockquote>
          <div className="review-center-grade">
            <button type="button" onClick={()=>rate(false)}>Chưa nhớ <small>Ôn lại ngày mai</small></button>
            <button type="button" onClick={()=>rate(true)}>Nhớ được <small>Giãn lịch ôn</small></button>
          </div>
        </div>:<button type="button" className="review-center-reveal" onClick={()=>setRevealed(true)}>
          Lật thẻ xem đáp án
        </button>}
      </div>:<div className="review-center-empty">
        <div aria-hidden="true">✓</div>
        <h3>{dueIds.length?"Không còn thẻ đến hạn ở cấp độ này.":"Bạn đã ôn xong các từ đến hạn!"}</h3>
        <p>{dueIds.length?"Thử chọn Tất cả hoặc một cấp độ khác.":"Hãy tiếp tục học 5 từ mới mỗi ngày; các thẻ sẽ trở lại đúng lịch."}</p>
        <a href="/">Về bài học hôm nay →</a>
      </div>}
      <p className="review-center-note">Sự thay đổi được lưu vào tiến độ FastEnglish trên trình duyệt.
        Khi học trên thiết bị khác, hãy dùng tính năng Sao lưu/Khôi phục trên trang chính.</p>
    </section>
  </main>;
}
