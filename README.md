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


## Reading Studio v2 (20/10/2026)

### Tra từ ngay trong bài
Bôi chọn một từ hoặc cụm ngắn ngay trong bài đọc để mở popup. Popup hiển thị nghĩa tiếng Việt khi từ có trong glossary/vocabulary, phát âm IPA và giải thích tiếng Anh qua Free Dictionary API khi tra được. Nút **Nghe** dùng Web Speech API; **Tra nghĩa** mở Google Translate. Bốn màu highlight vẫn có sẵn.

### Flashcard từ highlight
Phần ôn được tạo tự động từ các highlight tối đa 120 ký tự ở tất cả bài, hoặc chỉ bài hiện tại. Lật thẻ để xem nghĩa và ngữ cảnh gốc, rồi đánh dấu **Chưa nhớ** hoặc **Nhớ rồi**; ôn lại theo mốc 1/3/7/14/30/60 ngày. Trạng thái ôn ở key localStorage fastenglish-reading-flashcards-v1, không thay đổi streak, dữ liệu highlight hay bài ôn cũ. Xóa highlight sẽ loại nó khỏi bộ flashcard.

### Reading comprehension
Nút **Làm 5 câu đọc hiểu** dùng bài kiểm tra dựa trên key ideas và vocabulary của bài; luôn hoạt động ngay cả khi không cấu hình AI.
Nút **Thử tạo câu hỏi bằng AI** gửi duy nhất ID bài đọc tới endpoint server /api/reading-quiz, server chỉ sử dụng nội dung trong lib/articles.ts, không gửi highlight cá nhân hay dữ liệu tài khoản. Khi có biến môi trường OPENAI_API_KEY trên Vercel, endpoint dùng OpenAI Responses API để tạo 5 câu và giải thích. Có thể đổi model qua OPENAI_READING_MODEL. Nếu API chưa được cấu hình/không khả dụng, endpoint chuyển sang bộ câu hỏi offline và giao diện ghi rõ nguồn — **không giả nhận câu hỏi offline là do AI tạo ra**.

**Lưu ý vận hành:** Không đưa khóa API vào mã frontend. Nếu bật AI trên website công khai, nên thêm đăng nhập, quota, rate limit bên ngoài (Vercel WAF, v.v.) để tránh chi phí phát sinh. Nếu web chỉ dùng cá nhân, có thể để chế độ offline mặc định.

### Giới hạn
- Dữ liệu flashcard vẫn là localStorage, chưa đồng bộ nhiều thiết bị.
- Nội dung tra từ từ Free Dictionary API là tiếng Anh và có thể không có kết quả với cụm dài.
- Kiểm tra không-AI chủ yếu kiểm tra nhận diện ý và từ vựng; AI giúp tạo câu suy luận phong phú hơn nếu được cấu hình.
