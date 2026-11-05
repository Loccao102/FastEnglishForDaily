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


## Sao lưu và khôi phục toàn bộ dữ liệu học

Ở cuối trang chính, dùng **Sao lưu dữ liệu** để tải xuống một file JSON.
Bản sao lưu bao gồm tiến độ 5 từ/ngày, streak, lịch sử bài kiểm tra, highlight/ghi chú,
cài đặt đọc và lịch giãn cách của flashcard. Tất cả chạy trong trình duyệt, không gửi
dữ liệu tới server hay dịch vụ bên ngoài.

Trên máy/trình duyệt mới, chọn **Khôi phục từ file** và xác nhận ghi đè.
Hệ thống kiểm tra định dạng, giới hạn file 5MB, chỉ chấp nhận đúng bốn kho dữ liệu
FastEnglish và tải lại trang sau khi khôi phục. Dữ liệu học hiện có trên thiết bị
sẽ bị thay thế, vì vậy hãy sao lưu trước nếu muốn giữ lại.

File JSON có thể chứa nội dung ghi chú cá nhân; không chia sẻ công khai và không
commit file backup lên GitHub.


## Phân tích học tập cá nhân

Màn hình chính bổ sung mục **Phân tích**: 14 ô nhật ký học, số ngày học/luyện trong 7 ngày qua, độ chính xác của bài luyện (chỉ tính câu có kết quả thực tế), danh sách từ đến hạn và những từ đã trả lời sai nhiều lần. Có nút phát âm cho từng từ yếu và đường dẫn quay về bài luyện.

Mọi số liệu tính trực tiếp từ lịch sử localStorage đang lưu; chưa có dữ liệu thì hiển thị dấu gạch ngang chứ không đặt điểm giả. Các chỉ số cũng được giữ lại khi sao lưu/khôi phục tiến độ bằng file JSON.

## Trung tâm ôn tập — /review

Trên thanh điều hướng ở trang chính, chọn **Ôn tất cả từ** hoặc từ bảng **Phân tích**. Trang /review tập hợp **toàn bộ** từ có lịch ôn đã đến hạn trong dữ liệu hiện tại, thay vì chỉ hai câu thực hành hằng ngày.

- Lọc theo B2/C1/C2, nghe phát âm, tự trả lời trước khi lật đáp án.
- Đánh giá **Chưa nhớ** hoặc **Nhớ được**. Lịch ôn được cập nhật bằng đúng quy tắc của bài ôn hiện tại (Leitner), không tự thay đổi streak, số buổi học hoặc kết quả weekly quiz.
- Các từ đã ôn biến mất khỏi hàng chờ hiện tại và quay lại khi đến hạn; từ tồn nhiều ngày hoặc sai nhiều lần được ưu tiên.
- Lưu trực tiếp dưới cùng key `fastenglish-progress-v1` nên có trong bản sao lưu/khôi phục JSON đã hỗ trợ. Nếu trang học ở tab khác đang mở, hãy tránh đồng thời cập nhật cùng một từ để giảm nguy cơ ghi đè từ tab cũ.
- Trang /review hoạt động offline sau khi ứng dụng đã được tải nhưng không phải PWA đầy đủ; không có DB hay tài khoản.

## Ôn chủ động bằng cách viết từ vựng

Trong `/review`, chọn **Viết lại từ tiếng Anh**. Ứng dụng hiển thị nghĩa tiếng Việt và loại từ, người học phải nhập lại đúng chính tả tiếng Anh mà không được xem trước đáp án. Nút **Kiểm tra** so sánh nghiêm ngặt với từ gốc: không phân biệt hoa/thường, khoảng trắng thừa và khác biệt dấu nối typography; các lỗi gõ chữ khác vẫn bị đánh giá sai.

- Khi kiểm tra, kết quả hiển thị từ chuẩn và câu ví dụ. Chỉ sau khi bấm **Ghi nhận kết quả và sang thẻ tiếp** thì lịch ôn Leitner mới được cập nhật.
- Có thể chuyển sang **Lật thẻ tự đánh giá** nếu đang muốn tập nhớ nghĩa. Khi chuyển chế độ hoặc cấp độ, câu trả lời đang nhập được xóa.
- Chế độ viết chính tả không cần AI API hoặc máy chủ; kết quả lưu vào cùng tiến độ localStorage, nằm trong file sao lưu đã hỗ trợ.
- Đánh giá chính tả chỉ dựa trên một đáp án từ vựng chuẩn, không đánh giá câu nói hay paraphrase đồng nghĩa. Không tự chấm khi còn chưa bấm Ghi nhận.

## Tối ưu tạo kế hoạch từ vựng và quiz

Thuật toán chọn 5 từ/ngày được tách thành module có kiểm thử và lập chỉ mục theo B2/C1/C2 một lần cho mỗi bộ từ vựng, thay vì mỗi lượt chọn lại quét cả danh sách hai lần. Bộ tạo số ngẫu nhiên và seed **giữ nguyên**, vì vậy ngày học, thứ tự và những từ đã chọn trước đây không thay đổi.

Tìm kỳ quiz chưa làm dùng một tập hợp các kỳ hoàn tất, thay cho quét toàn bộ lịch sử ở từng kỳ. Quiz 7 ngày chỉ được tính lại khi lịch học/ngày hoàn tất thay đổi, không tính lại bởi cập nhật tiến độ không liên quan.

Kiểm thử đối chiếu với thuật toán cũ qua nhiều ngày và ba trạng thái từ đã học, cùng bản kiểm tra seeded shuffle. Không đổi cấu trúc localStorage, không xóa streak/tiến độ, không yêu cầu API.

## Tự chuyển ngày học khi tab mở lâu

Cả trang học 5 từ mỗi ngày và `/review` đều theo ngày **local của trình duyệt**. Khi qua nửa đêm, ứng dụng tự tạo lịch ngày mới và cập nhật những thẻ đến hạn mà không cần tải lại trang. Khi người học quay lại tab sau thời gian dài, ứng dụng kiểm tra ngày ngay lúc tab hiện ra hoặc cửa sổ được focus.

Thay vì polling mỗi phút/giây, ứng dụng chỉ đặt một timeout tới ngay sau **nửa đêm tiếp theo**, rồi đặt lại. `useStudyDay` dọn timer và event listeners khi component unmount, không thêm network request hay lưu cache ngày.

Khi ngày thay đổi, câu trả lời đang dở trên trang ôn được xóa để tránh chấm theo ngày cũ; những kết quả đã ghi nhận vẫn nằm trong localStorage. Điều này không thay đổi thuật toán spaced repetition hoặc bản sao lưu dữ liệu.
