import assert from "node:assert/strict";
import {test} from "node:test";
import {WORDS} from "../lib/words.ts";
import {hashString,seededShuffle,selectDailyWords,pendingQuizCycle} from "../lib/daily-planning.ts";

function oldRandom(seed){
  return ()=>{let t=(seed+=0x6d2b79f5);t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;};
}
function oldShuffle(items,seed){
  const result=[...items],random=oldRandom(seed);
  for(let i=result.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}
function oldDailyPlan(date,learned){
  const seed=hashString(date);
  const patterns=[
    ["B2","C1","B2","C2","C1"],["C1","B2","C2","B2","C1"],
    ["B2","C2","C1","C1","B2"],["C2","B2","C1","B2","C1"]
  ];
  const used=new Set(),result=[];
  patterns[seed%patterns.length].forEach((level,index)=>{
    const fresh=WORDS.filter(entry=>entry.level===level&&!learned.has(entry.id)&&!used.has(entry.id));
    const fallback=WORDS.filter(entry=>entry.level===level&&!used.has(entry.id));
    const choice=oldShuffle(fresh.length?fresh:fallback,seed+index*997)[0];
    if(choice){used.add(choice.id);result.push(choice.id);}
  });
  return result;
}

test("optimized planner preserves the exact five daily words already chosen by legacy logic",()=>{
  const known=new Set(WORDS.slice(0,21).map(word=>word.id));
  const almostAll=new Set(WORDS.slice(0,-5).map(word=>word.id));
  for(const date of ["2026-01-01","2026-03-21","2026-11-05","2027-12-31","2030-02-28"]){
    for(const learned of [new Set(),known,almostAll]){
      const actual=selectDailyWords(date,learned,WORDS);
      assert.deepEqual(actual,oldDailyPlan(date,learned));
      assert.equal(actual.length,5);
      assert.equal(new Set(actual).size,5);
      assert.deepEqual(selectDailyWords(date,learned,WORDS),actual);
    }
  }
});

test("shared shuffle preserves the current learning-plan seed algorithm",()=>{
  for(const seed of [0,1,2026,0xffffffff]){
    const values=Array.from({length:39},(_,i)=>i);
    assert.deepEqual(seededShuffle(values,seed),oldShuffle(values,seed));
    assert.deepEqual(values,Array.from({length:39},(_,i)=>i));
  }
});

test("pending quiz finder handles completed, missing and out-of-order cycles",()=>{
  assert.equal(pendingQuizCycle(6,[]),null);
  assert.equal(pendingQuizCycle(7,[]),1);
  assert.equal(pendingQuizCycle(21,[{cycle:2},{cycle:1}]),3);
  assert.equal(pendingQuizCycle(28,[{cycle:1},{cycle:3},{cycle:4}]),2);
  assert.equal(pendingQuizCycle(14,[{cycle:1},{cycle:2}]),null);
});
