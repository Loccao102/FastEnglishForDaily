# FastEnglishForDaily

Trang học từ vựng cá nhân: **5 từ B2–C2 mỗi ngày**, streak và bài kiểm tra sau mỗi 7 buổi học.

## Chạy local

    npm install
    npm run dev

Mở http://localhost:3000.

## Deploy Vercel

Import repo này vào Vercel. Không cần database, không cần biến môi trường.

## Cách lưu dữ liệu

Tiến độ được lưu bằng localStorage trên trình duyệt:
- 5 từ đã chọn cho từng ngày
- streak
- ngày đã hoàn thành
- danh sách từ đã học
- điểm weekly review

Vì đây là app cá nhân không có DB, xóa dữ liệu trình duyệt hoặc đổi trình duyệt/thiết bị sẽ tạo tiến độ mới.

## Logic học

- 5 từ mỗi ngày, phân bố B2/C1/C2.
- Bộ từ hôm nay được cố định theo ngày; refresh không đổi từ.
- Ưu tiên từ chưa từng học.
- Sau mỗi 7 buổi học hoàn thành, mở một bài review 10 câu từ 35 từ của chu kỳ đó.
- Có phát âm bằng Web Speech API của trình duyệt.


## Reading Studio — highlight & notebook

- Mở **Bài đọc hôm nay** hoặc một bài trong thư viện.
- Bôi đen một từ/cụm từ trong cùng một đoạn (chuột, phím hoặc nhấn giữ trên thiết bị cảm ứng), sau đó chọn một trong bốn màu để lưu.
- Những phần đã tô màu sẽ được đánh dấu ngay trong bài và xuất hiện trong **Sổ tay highlight**. Có thể đổi màu, viết ghi chú/nghĩa tự ghi, phát âm và bỏ lưu.
- Từ gợi ý trong thanh bên có nút **＋** để lưu nhanh khi từ xuất hiện trong bài.
- Nút A−/A+ và nền Sáng/Kem/Tối tùy chỉnh trải nghiệm đọc; tùy chọn được ghi nhớ.

Highlight được lưu ở localStorage key fastenglish-reader-highlights-v1, thiết lập đọc ở fastenglish-reader-settings-v1. Hai key này độc lập với fastenglish-progress-v1 để giữ nguyên streak/tiến độ cũ khi nâng cấp. Nút **Reset local** đặt lại tiến độ học, **không** xóa sổ tay; xóa từng highlight trong sổ tay nếu cần. Chưa có đồng bộ đám mây: đổi trình duyệt hoặc xóa dữ liệu web sẽ mất ghi chú.

Font Be Vietnam Pro (giao diện) và Literata (nội dung bài đọc) được nạp từ Google Fonts, với fallback hệ thống nếu offline. Giao diện không yêu cầu server hay AI để lưu highlight.
