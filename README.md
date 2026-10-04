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
