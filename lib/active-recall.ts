/** Exact spelling recall: normalize casing, spaces and typography, but not letters.
 * A real misspelling must remain wrong for spaced-repetition scheduling.
 */
export function normalizeRecall(value:string):string{
  return value.normalize("NFKC").trim().toLocaleLowerCase("en")
    .replace(/[\u2018\u2019]/g,"'")
    .replace(/[\u2013\u2014]/g,"-")
    .replace(/\s+/g," ");
}
export function isSpellingCorrect(typed:string,target:string):boolean{
  if(!target.trim()||!typed.trim())return false;
  return normalizeRecall(typed)===normalizeRecall(target);
}
export function compareSpelling(typed:string,target:string):{
  correct:boolean;expected:string;submitted:string
}{
  return {
    correct:isSpellingCorrect(typed,target),
    expected:target.trim(),submitted:typed.trim()
  };
}
