import assert from "node:assert/strict";
import {test} from "node:test";
import {chooseNextLearningAction} from "../lib/learning-next.ts";

const base={
  completedToday:false,revealedToday:0,totalToday:5,
  practicedToday:false,dueWords:0,pendingWeeklyQuiz:false,readToday:false
};
function next(overrides={}){return chooseNextLearningAction({...base,...overrides});}

test("first visit links straight to new vocabulary",()=>{
  assert.equal(next().href,"#today");
  assert.match(next().label,/5 từ/);
});

test("partly revealed vocabulary shows exactly how much remains",()=>{
  assert.equal(next({revealedToday:3}).label,"Xem 2 từ còn lại");
  assert.equal(next({revealedToday:3}).href,"#today");
});

test("study steps lead to practice and then final completion",()=>{
  assert.equal(next({revealedToday:5}).href,"#daily-practice");
  assert.equal(next({revealedToday:5,practicedToday:true}).href,"#finish-today");
});

test("after completing daily work, overdue review is prioritized",()=>{
  const action=next({completedToday:true,revealedToday:5,practicedToday:true,dueWords:8,pendingWeeklyQuiz:true});
  assert.equal(action.href,"/review");
  assert.match(action.label,/8 từ/);
});

test("weekly quiz and reading appear only when appropriate",()=>{
  assert.equal(next({completedToday:true,pendingWeeklyQuiz:true}).href,"#weekly-review");
  assert.equal(next({completedToday:true}).href,"#daily-reading");
  assert.equal(next({completedToday:true,readToday:true}).href,"#learning-insights");
});

test("a state with more revealed cards than expected does not show negative remaining words",()=>{
  assert.equal(next({revealedToday:99}).href,"#daily-practice");
});
