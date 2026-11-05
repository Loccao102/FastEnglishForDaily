/** Choose one clear next action instead of sending learners to the same section every visit. */
export type LearningStepState={
  completedToday:boolean;
  revealedToday:number;
  totalToday:number;
  practicedToday:boolean;
  dueWords:number;
  pendingWeeklyQuiz:boolean;
  readToday:boolean;
};
export type LearningAction={
  href:string;
  label:string;
  description:string;
};
export function chooseNextLearningAction(state:LearningStepState):LearningAction{
  const left=Math.max(0,state.totalToday-state.revealedToday);
  if(!state.completedToday){
    if(left>0)return {
      href:"#today",label:left===state.totalToday?"Học 5 từ hôm nay":"Xem "+left+" từ còn lại",
      description:left+" từ cần mở nghĩa trước khi hoàn tất buổi học."
    };
    if(!state.practicedToday)return {
      href:"#daily-practice",label:"Làm bài luyện tập",description:"Đã mở đủ từ mới. Tiếp theo là hai bài luyện nhớ."
    };
    return {
      href:"#finish-today",label:"Hoàn thành ngày học",
      description:"Bạn đã học từ và luyện tập. Xác nhận để cập nhật chuỗi ngày."
    };
  }
  if(state.dueWords>0)return {
    href:"/review",label:"Ôn "+state.dueWords+" từ đến hạn",
    description:"Giữ vững kiến thức bằng ôn tập cách quãng."
  };
  if(state.pendingWeeklyQuiz)return {
    href:"#weekly-review",label:"Làm kiểm tra 7 ngày",
    description:"Kiểm tra trí nhớ với các từ đã học trong tuần."
  };
  if(!state.readToday)return {
    href:"#daily-reading",label:"Đọc bài tiếng Anh hôm nay",
    description:"Một bài đọc ngắn để áp dụng từ vựng vào ngữ cảnh."
  };
  return {
    href:"#learning-insights",label:"Xem tiến độ của mình",
    description:"Đã xong các mục hôm nay. Xem những gì bạn đã tiến bộ."
  };
}
