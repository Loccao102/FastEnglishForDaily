import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createReviewState, applyReviewResult, dueReviewIds,
  isReviewState, localStudyDate
} from "../lib/review-schedule.ts";

test("review schedule matches the existing daily practice intervals",()=>{
  const first=createReviewState("2026-11-05");
  assert.equal(first.nextReviewDate,"2026-11-06");
  const right=applyReviewResult(first,true,"2026-11-06");
  assert.equal(right.box,1);
  assert.equal(right.nextReviewDate,"2026-11-08");
  const second=applyReviewResult(right,true,"2026-11-08");
  assert.equal(second.nextReviewDate,"2026-11-12");
  const forgotten=applyReviewResult(second,false,"2026-11-13");
  assert.equal(forgotten.box,0);
  assert.equal(forgotten.wrongCount,1);
  assert.equal(forgotten.nextReviewDate,"2026-11-14");
  assert.equal(first.correctCount,0);
});

test("due list excludes unknown, malformed and future words",()=>{
  const base=createReviewState("2026-11-01");
  const known=new Set(["a","b","future"]);
  const review={
    a:{...base,nextReviewDate:"2026-11-03",wrongCount:2},
    b:{...base,nextReviewDate:"2026-11-03",wrongCount:5},
    future:{...base,nextReviewDate:"2026-12-01"},
    unknown:{...base,nextReviewDate:"2026-11-01"},
    bad:{...base,box:99}
  };
  assert.deepEqual(dueReviewIds(review,known,"2026-11-05"),["b","a"]);
  assert.equal(isReviewState(review.bad),false);
});

test("study date uses local date and works across months",()=>{
  assert.equal(localStudyDate(new Date(2026,10,5)),"2026-11-05");
  const result=applyReviewResult(createReviewState("2026-12-30"),false,"2026-12-31");
  assert.equal(result.nextReviewDate,"2027-01-01");
});
