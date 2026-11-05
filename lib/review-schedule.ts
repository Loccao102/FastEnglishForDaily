/** Shared spaced repetition rules for daily practice and dedicated catch-up reviews. */
export type ReviewState={
  box:number;
  nextReviewDate:string;
  correctCount:number;
  wrongCount:number;
  lastReviewedDate:string|null;
};

export function localStudyDate(date=new Date()):string{
  return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+
    "-"+String(date.getDate()).padStart(2,"0");
}

function addDays(dateKey:string,days:number):string{
  const parts=dateKey.split("-").map(Number);
  const date=new Date(parts[0],parts[1]-1,parts[2]);
  if(Number.isNaN(date.getTime()))throw new Error("Ngày ôn tập không hợp lệ.");
  date.setDate(date.getDate()+days);
  return localStudyDate(date);
}

export function createReviewState(dateKey:string):ReviewState{
  return {
    box:0,nextReviewDate:addDays(dateKey,1),
    correctCount:0,wrongCount:0,lastReviewedDate:null
  };
}

export function applyReviewResult(state:ReviewState,correct:boolean,dateKey:string):ReviewState{
  if(!correct)return {
    ...state,box:0,nextReviewDate:addDays(dateKey,1),
    wrongCount:state.wrongCount+1,lastReviewedDate:dateKey
  };
  const nextBox=Math.min(5,state.box+1);
  const intervals=[1,2,4,7,14,30];
  return {
    ...state,box:nextBox,nextReviewDate:addDays(dateKey,intervals[nextBox]),
    correctCount:state.correctCount+1,lastReviewedDate:dateKey
  };
}

export function isReviewState(value:unknown):value is ReviewState{
  if(!value||typeof value!=="object")return false;
  const state=value as Partial<ReviewState>;
  return typeof state.box==="number"&&Number.isInteger(state.box)&&state.box>=0&&state.box<=5&&
    typeof state.nextReviewDate==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(state.nextReviewDate)&&
    typeof state.correctCount==="number"&&Number.isInteger(state.correctCount)&&state.correctCount>=0&&
    typeof state.wrongCount==="number"&&Number.isInteger(state.wrongCount)&&state.wrongCount>=0&&
    (state.lastReviewedDate===null||typeof state.lastReviewedDate==="string");
}

export function dueReviewIds(
  review:Record<string,ReviewState>,
  knownIds:ReadonlySet<string>,
  today:string
):string[]{
  return Object.entries(review)
    .filter(([id,state])=>knownIds.has(id)&&isReviewState(state)&&state.nextReviewDate<=today)
    .sort((a,b)=>a[1].nextReviewDate.localeCompare(b[1].nextReviewDate)||
      b[1].wrongCount-a[1].wrongCount||a[0].localeCompare(b[0]))
    .map(([id])=>id);
}
