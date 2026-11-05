"use client";

import { useRef, useState } from "react";
import {
  makeLearningBackup, parseLearningBackup, restoreLearningBackup
} from "@/lib/learning-backup";

export default function LearningBackupControls() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function downloadBackup() {
    setMessage("");
    try {
      const content = makeLearningBackup(window.localStorage);
      const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "fastenglish-learning-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setMessage("Đã tạo file sao lưu. Hãy giữ file ở nơi an toàn.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể sao lưu dữ liệu.");
    }
  }

  async function importBackup(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Bản sao lưu vượt quá 5MB.");
      const content = await file.text();
      // Parse and validate the entire file before asking to overwrite local data.
      parseLearningBackup(content);
      if (!window.confirm("Khôi phục sẽ thay thế toàn bộ tiến độ, highlight, cài đặt đọc và lịch ôn flashcard hiện có trên thiết bị này. Tiếp tục?")) return;
      restoreLearningBackup(window.localStorage, content);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể khôi phục dữ liệu.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <section className="learning-backup" aria-labelledby="learning-backup-title">
      <div>
        <span className="eyebrow">YOUR LEARNING DATA</span>
        <h2 id="learning-backup-title">Giữ lại hành trình học của bạn</h2>
        <p>Sao lưu tiến độ, streak, highlight, ghi chú, cài đặt đọc và lịch ôn flashcard
          thành một file JSON. Khôi phục trên trình duyệt hoặc thiết bị khác mà không cần tài khoản.</p>
        <p className="learning-backup-note">Dữ liệu nằm trên thiết bị; file tải về có thể chứa ghi chú riêng tư.
          Khôi phục sẽ ghi đè dữ liệu học đang lưu trên trình duyệt này.</p>
      </div>
      <div className="learning-backup-actions">
        <button type="button" onClick={downloadBackup} disabled={busy}>↓ Sao lưu dữ liệu</button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={busy}>
          ↑ {busy ? "Đang khôi phục…" : "Khôi phục từ file"}
        </button>
        <input ref={fileInput} type="file" hidden accept=".json,application/json"
          onChange={event => void importBackup(event.target.files?.[0])} />
      </div>
      {message && <p className="learning-backup-message" role="status">{message}</p>}
    </section>
  );
}
