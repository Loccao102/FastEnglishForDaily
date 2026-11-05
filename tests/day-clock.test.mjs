import assert from "node:assert/strict";
import {test} from "node:test";
import {nextLocalMidnightDelay} from "../lib/day-clock.ts";

test("study day rollover schedules just past local midnight",()=>{
  const now=new Date(2026,10,5,23,59,59,500);
  const delay=nextLocalMidnightDelay(now);
  assert.equal(delay,550);
  const next=new Date(now.getTime()+delay);
  assert.equal(next.getDate(),6);
  assert.equal(next.getHours(),0);
  assert.equal(next.getMinutes(),0);
});

test("does not poll while a page stays open all day",()=>{
  const morning=new Date(2026,10,5,8,30,0);
  const remaining=nextLocalMidnightDelay(morning);
  assert.ok(remaining>15*60*60*1000);
  assert.ok(remaining<16*60*60*1000);
});

test("automatically crosses month and year boundaries",()=>{
  for(const date of [new Date(2026,10,30,22),new Date(2026,11,31,23,59,59,999),new Date(2028,1,29,20)]){
    const next=new Date(date.getTime()+nextLocalMidnightDelay(date));
    assert.equal(next.getHours(),0);
    assert.equal(next.getMinutes(),0);
    assert.notEqual(next.toDateString(),date.toDateString());
  }
});

test("invalid clock value is rejected",()=>{
  assert.throws(()=>nextLocalMidnightDelay(new Date("not-a-date")),/không hợp lệ/);
});
