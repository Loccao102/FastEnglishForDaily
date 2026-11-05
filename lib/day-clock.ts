/** Delay until shortly after the next local midnight.
 * Constructing the next local calendar day handles 23/25-hour DST days.
 */
export function nextLocalMidnightDelay(now:Date):number{
  if(Number.isNaN(now.getTime()))throw new Error("Ngày không hợp lệ.");
  const next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0,50);
  return Math.max(1,next.getTime()-now.getTime());
}
