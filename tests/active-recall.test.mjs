import assert from "node:assert/strict";
import {test} from "node:test";
import {isSpellingCorrect,normalizeRecall,compareSpelling} from "../lib/active-recall.ts";

test("spelling recall ignores only case and harmless spacing",()=>{
  assert.equal(isSpellingCorrect(" Allocate ","allocate"),true);
  assert.equal(isSpellingCorrect("HEALTH-CARE","health-care"),true);
  assert.equal(isSpellingCorrect("  take   over ","take over"),true);
  assert.equal(normalizeRecall("It’s — OK"),"it's - ok");
});

test("real spelling mistakes, missing words and extra characters are wrong",()=>{
  assert.equal(isSpellingCorrect("allocatte","allocate"),false);
  assert.equal(isSpellingCorrect("allocate.","allocate"),false);
  assert.equal(isSpellingCorrect("allocate now","allocate"),false);
  assert.equal(isSpellingCorrect("","allocate"),false);
  assert.equal(isSpellingCorrect("allocate",""),false);
});

test("feedback retains canonical target without changing the submitted answer",()=>{
  const result=compareSpelling("allocatte","allocate");
  assert.deepEqual(result,{correct:false,expected:"allocate",submitted:"allocatte"});
});
