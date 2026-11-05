"use client";
import {useEffect,useState} from "react";
import {nextLocalMidnightDelay} from "@/lib/day-clock";
import {localStudyDate} from "@/lib/review-schedule";

/** Resync both on local midnight and when an inactive tab becomes visible. */
export function useStudyDay():string{
  const [today,setToday]=useState(()=>localStudyDate());
  useEffect(()=>{
    let timer:number|undefined;
    const update=()=>{
      const now=new Date();
      setToday(localStudyDate(now));
      if(timer!==undefined)window.clearTimeout(timer);
      timer=window.setTimeout(update,nextLocalMidnightDelay(now));
    };
    const onVisibility=()=>{if(document.visibilityState==="visible")update();};
    update();
    window.addEventListener("focus",update);
    document.addEventListener("visibilitychange",onVisibility);
    return ()=>{
      if(timer!==undefined)window.clearTimeout(timer);
      window.removeEventListener("focus",update);
      document.removeEventListener("visibilitychange",onVisibility);
    };
  },[]);
  return today;
}
