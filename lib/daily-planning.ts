import type { CefrLevel, WordEntry } from "./words";

/** Existing seeded random sequence is a compatibility contract:
 * learners must not receive different words for the same saved date. */
export function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  const random = mulberry32(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

const levelCache = new WeakMap<readonly WordEntry[], Record<CefrLevel, WordEntry[]>>();
function byLevel(words:readonly WordEntry[]) {
  const existing=levelCache.get(words);
  if(existing)return existing;
  const grouped:Record<CefrLevel,WordEntry[]>={B2:[],C1:[],C2:[]};
  for(const word of words)grouped[word.level].push(word);
  levelCache.set(words,grouped);
  return grouped;
}

/** Selects the same daily word IDs as the earlier full-catalog filtering
 * implementation, while scanning only the selected CEFR group each turn. */
export function selectDailyWords(dateKey:string,learnedIds:ReadonlySet<string>,words:readonly WordEntry[]):string[]{
  const seed = hashString(dateKey);
  const patterns:CefrLevel[][] = [
    ["B2","C1","B2","C2","C1"],
    ["C1","B2","C2","B2","C1"],
    ["B2","C2","C1","C1","B2"],
    ["C2","B2","C1","B2","C1"]
  ];
  const levels=patterns[seed%patterns.length];
  const groups=byLevel(words);
  const used=new Set<string>();
  const result:string[]=[];
  levels.forEach((level,index)=>{
    const group=groups[level];
    const fresh=group.filter(entry=>!learnedIds.has(entry.id)&&!used.has(entry.id));
    const pool=fresh.length?fresh:group.filter(entry=>!used.has(entry.id));
    const picked=seededShuffle(pool,seed+index*997)[0];
    if(picked){used.add(picked.id);result.push(picked.id);}
  });
  return result;
}

/** A Set avoids repeatedly scanning every completed cycle for each quiz. */
export function pendingQuizCycle(completedCount:number,quizResults:ReadonlyArray<{cycle:number}>):number|null{
  const eligible=Math.floor(completedCount/7);
  const done=new Set(quizResults.map(item=>item.cycle));
  for(let cycle=1;cycle<=eligible;cycle++){
    if(!done.has(cycle))return cycle;
  }
  return null;
}
