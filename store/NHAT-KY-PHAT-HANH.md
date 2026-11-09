# Nhật ký phát hành Google Play – Mom Ơi

Ghi lại từng mốc phát hành trên Google Play để cuối kỳ tổng hợp vào báo cáo môn học
và để trả lời bảng câu hỏi khi xin quyền phát hành bản chính thức.

- **Ứng dụng:** Mom Ơi (`com.momoi.healthcare`)
- **Tài khoản nhà phát triển:** cá nhân ("obthack")
- **Kênh:** Thử nghiệm khép kín – Alpha, quốc gia Việt Nam
- **Build:** EAS Build (tài khoản Expo `xiaobo12`), số phiên bản (versionCode) do EAS tự tăng

## Tóm tắt các bản

| Ngày | Bản | Nội dung chính | Kết quả |
|---|---|---|---|
| 27/10/2026 | 3 (1.0.0) | Bản đầu tiên gửi duyệt | Bị từ chối |
| 27/10/2026 | 4 (1.0.0) | Ẩn tính năng y tế, sửa tờ khai | Được duyệt, xuất bản |
| 01/11/2026 | 5 (1.0.0) | Cho phép đổi họ và tên trong Hồ sơ | Được duyệt, xuất bản 01/11 |
| 01/11/2026 | (không đổi bản) | Mở kênh Alpha cho tất cả quốc gia | Được duyệt 01/11, kênh có 178 quốc gia/khu vực |
| 06/11/2026 | 6 (1.0.0) | Thêm tiếng Anh, cải thiện thông báo lỗi, trang cửa hàng tiếng Anh | Được duyệt, xuất bản 06/11 |
| 06/11/2026 | (tài khoản) | Khai báo trạng thái người bán (EU DSA): pháp nhân phi thương mại | Đã khai báo |
| 09/11/2026 | 7 (1.1.0) | Màu theo giới tính bé, màn Cài đặt (ngôn ngữ, phiên bản), tiếng Anh cho toàn bộ màn phụ | Đang chuẩn bị, chưa build |

## Chi tiết

### 27/10/2026 – Bản 3: bị từ chối

- Gửi duyệt lần đầu, gồm trang thông tin cửa hàng, toàn bộ tờ khai Nội dung ứng dụng
  (An toàn dữ liệu, Sức khỏe, Quảng cáo, Đối tượng 18+…) và kênh Alpha.
- **Lý do bị từ chối:** vi phạm *Play Console Requirements*. Tờ khai Sức khỏe chọn
  7 mục thuộc nhóm **Y tế** (quản lý bệnh, sơ cứu và cấp cứu, sức khỏe tinh thần,
  giáo dục y khoa, quản lý thuốc, vật lý trị liệu, sức khỏe sinh sản). Từ 31/08/2024,
  Google chỉ cho phát hành ứng dụng y tế từ **tài khoản tổ chức**, cần có số D-U-N-S.
- **Hướng xử lý nhóm chọn:** giữ tài khoản cá nhân vì là project môn học, không có
  pháp nhân. Tắt các tính năng mang tính y tế trên bản Play.

### 27/10/2026 – Bản 4: được duyệt

**Thay đổi trong app:**
- Thêm cờ `MEDICAL_FEATURES_ENABLED = false` trong `src/constants/features.ts`.
  Cờ này tắt khảo sát EPDS, lịch trình IVF, trang Khẩn cấp và danh sách bệnh có thể
  gặp trong kết quả AI. Code vẫn giữ nguyên, có tài khoản tổ chức thì chỉ cần bật lại.
- Trợ lý AI đổi tên thành "Hỏi Mom Ơi AI · Gợi ý chăm sóc mẹ & bé", thêm câu
  "Gợi ý không phải chẩn đoán và không thay thế bác sĩ". Vẫn giữ nút gọi 115 khi
  AI đánh giá là khẩn cấp.
- "Lịch uống thuốc" đổi thành "Lịch uống vitamin", bỏ nội dung "thuốc bác sĩ kê".

**Thay đổi trên Play Console:**
- Tờ khai Sức khỏe: bỏ cả 7 mục Y tế, chỉ giữ 5 mục *Sức khỏe & thể chất*
  (vận động, cân nặng và dinh dưỡng, theo dõi chu kỳ, giấc ngủ, căng thẳng).
- Viết lại mô tả cửa hàng: bỏ IVF, EPDS, lịch thuốc, hướng dẫn khẩn cấp.
- Danh mục ứng dụng giữ "Sức khỏe và thể dục".

**Người thử:** chuyển từ danh sách email sang Google Group cộng đồng test chéo
`cong-dong-12-tester-android@googlegroups.com`, đồng thời đăng bài nhờ test trong nhóm.

### 01/11/2026 – Bản 5: được duyệt

- **Tính năng mới:** người dùng đổi được họ và tên trong *Hồ sơ của mẹ*
  (nút "Đổi" → nhập tên → "Lưu tên"). Trước đó tên chỉ nhập được lúc đăng ký.
- **Backend:** thêm API `PUT /api/auth/name`, body `{ fullName }`, bắt buộc đăng nhập,
  tên không để trống và tối đa 100 ký tự. Đã deploy lên Railway trước khi build app.
- **App:** cập nhật `ProfileScreen`, `authStore`, `authService`; tên mới được lưu lại
  trên máy.
- **Ghi chú phát hành:** "Cho phép đổi họ và tên trong Hồ sơ."
- **Cảnh báo khi phát hành:** thiếu tệp gỡ rối mã R8/ProGuard. Cảnh báo này vô hại,
  không ảnh hưởng việc duyệt.

### 01/11/2026 – Mở kênh Alpha cho mọi quốc gia

- **Lý do:** người thử ở nước ngoài (trong cộng đồng test chéo) báo không tải được app,
  vì kênh Alpha trước đó chỉ phát hành ở Việt Nam.
- **Thay đổi:** kênh Alpha chuyển từ 1 quốc gia (Việt Nam) sang 176 quốc gia/khu vực,
  kèm tùy chọn "các nơi khác trên thế giới". Không cần build mới.
- **Lưu ý:** nội dung app và trang cửa hàng vẫn chỉ có tiếng Việt.

### 06/11/2026 – Bản 6: tiếng Anh

- **Lý do:** người thử nước ngoài (từ cộng đồng test chéo) không đọc được tiếng Việt.
- **Song ngữ Việt / Anh:**
  - App tự chọn theo ngôn ngữ của máy, có nút VI / EN ở màn khách, màn đăng nhập và Menu.
  - Đã dịch màn khách, đăng nhập/đăng ký, 5 tab chính, Hồ sơ, Gói của mẹ, Góp ý và các thông báo lỗi chung.
  - Màn phụ và nội dung server trả về (thực đơn, gợi ý tuần thai, câu trả lời AI) vẫn tiếng Việt. Màn AI ghi rõ điều này khi dùng tiếng Anh.
- **Thông báo lỗi và màn trống:**
  - Báo riêng trường hợp mất mạng.
  - Có nút tạo lại thực đơn khi chưa có thực đơn.
  - Nút "Thêm bé đầu tiên" khi chưa có hồ sơ bé.
- **Nội dung khớp với bản Play:**
  - Màn khách bỏ câu "hàng nghìn bà mẹ đang sử dụng" (số liệu không kiểm chứng) và "siêu âm".
  - Ẩn EPDS theo cờ tính năng; màn chào bỏ chữ "Y tế".
- **Thư viện:** cập nhật bản vá Expo 57 (57.0.32) và thêm `expo-localization`.
- **Play Console:** thêm trang cửa hàng tiếng Anh (en-US) gồm tên, mô tả ngắn, mô tả đầy đủ.
- **Thử nghiệm phụ:** trước buổi demo, nhóm nâng tạm lên SDK 58 để mở bằng Expo Go trên iPhone, demo xong hạ lại SDK 57. Thay đổi này không phát hành.

### 09/11/2026 – Bản 7 (1.1.0): đang chuẩn bị

- **Lý do:**
  - Một người thử báo app "vẫn 1.0.0", tưởng nhóm không cập nhật.
  - Thực tế đã có 3 bản (4, 5, 6), nhưng chỉ số nội bộ versionCode tăng. Số hiển thị versionName chưa đổi.
  - Người thử khuyên nâng số phiên bản để tester nhận ra có bản mới.
- **Số phiên bản:** `version` trong `app.json` đổi từ 1.0.0 lên **1.1.0**. Từ nay mỗi bản đều tăng số này:
  - Sửa lỗi nhỏ: tăng số cuối.
  - Thêm tính năng: tăng số giữa.
- **Màu giao diện theo bé (tự động, không có nút chọn):**
  - Mẹ tạo hồ sơ bé trai thì app chuyển sang màu xanh. Bé gái hoặc chưa có bé thì giữ màu hồng mặc định.
  - Có nhiều bé thì màu theo bé đang chọn ở tab Bé yêu.
  - Ban đầu có thêm nút chọn màu trong Menu, nhưng nhóm thấy không cần nên bỏ: màu chỉ đổi theo hồ sơ bé.
  - Màn khách trước khi đăng nhập giữ màu hồng làm màu thương hiệu.
  - Màu riêng của từng giai đoạn (chuẩn bị mang thai, mang thai, sau sinh) giữ nguyên.
  - **Kỹ thuật:** `src/theme/accent.ts` tạo sẵn style cho cả hai bảng màu, nên đổi màu không phải tạo lại style.
- **Tiếng Anh cho 17 màn phụ:**
  - Vitamin, nhật ký hằng ngày, thông báo, hồ sơ bé, thực đơn tuần, biểu đồ tăng trưởng.
  - Món ăn AI, thai kỳ, thực đơn thai kỳ, bài tập, sau sinh, chu kỳ và rụng trứng.
  - Lịch chăm sóc, thư giãn, lịch sử AI, chi tiết AI, xóa tài khoản.
  - Các phần dùng chung: ô chọn ngày, ghi bữa ăn, biểu đồ.
  - Dữ liệu gửi lên server (dị ứng, chế độ ăn, triệu chứng chu kỳ) vẫn lưu tiếng Việt để AI xử lý đúng. Tiếng Anh chỉ dùng để hiển thị.
- **Màn Cài đặt mới** (Menu → Tiện ích khác → Cài đặt):
  - Chọn ngôn ngữ Tiếng Việt / English. Trước đây nút ngôn ngữ nằm ngay đầu Menu.
  - Hiện số phiên bản app, để người thử tự kiểm tra đang dùng bản nào.
  - Màn khách và màn đăng nhập vẫn giữ nút VI / EN cho người chưa đăng nhập.
  - Thêm thư viện `expo-constants` (module của Expo) để đọc số phiên bản.
- **Sửa theo góp ý người thử: thanh tab bị thanh điều hướng của máy đè lên.** Có 4 góp ý cùng một lỗi:
  - #21 "Thanh tab Bottom bị che 1 xíu"
  - #54 "dính với menu dưới không bấm được"
  - #79 "viền dưới trùng với nút bấm home"
  - #97 "tab bar bị đè bởi nav bar của phone nên hơi khó chuyển tab"
  - **Nguyên nhân:** từ Android 15, app vẽ tràn xuống dưới thanh điều hướng của máy (edge-to-edge), trong khi thanh tab đặt chiều cao cố định 68px.
  - **Cách sửa:** thanh tab cộng thêm đúng chiều cao vùng an toàn của từng máy (máy 3 nút, máy vuốt, iPhone đều khác nhau).
  - Màn phụ, màn khách, đăng nhập và đăng ký cũng chừa khoảng này để nội dung cuối trang không bị che.
- **Sửa theo góp ý người thử: bàn phím che ô nhập và nút gửi.** Có 2 góp ý:
  - #59 "bàn phím hiển thị sẽ che mất phần nhập"
  - #96 "nhập bàn phím che mất nút để gửi"
  - **Nguyên nhân:** ở chế độ edge-to-edge, Android không tự co màn hình khi bàn phím mở. App chỉ xử lý bàn phím cho iOS.
  - **Cách sửa:** theo hướng dẫn của Expo, mọi màn có ô nhập dùng `KeyboardAvoidingView` với `behavior="padding"` trên cả hai nền tảng. Các màn được sửa:
    - Màn phụ dùng chung, Đăng nhập, Đăng ký, tab AI và Menu.
  - Thanh tab tự ẩn khi bàn phím mở.
  - Ở tab AI, khi mẹ bắt đầu gõ, màn tự cuộn để thấy cả ô nhập lẫn nút "Nhận gợi ý".
- **Làm gọn thẻ "Ghi nhận trong ngày" ở Tổng quan cho mẹ bầu dễ nhìn:**
  - Bỏ icon và phụ đề trang trí.
  - Số ly nước hiện to, nút "+ 1 ly" cao 44px, thanh tiến độ liền một vạch.
  - 5 mặt cảm xúc nằm đều trên một hàng.
  - Lối vào nhật ký đầy đủ thành một hàng lớn có mô tả.
- **Sửa lỗi tiềm ẩn:** hàm dịch `useT()` trả về hàm ổn định, tránh tải lại dữ liệu liên tục khi dùng trong `useCallback`.
- **Kiểm tra:** typecheck, lint và đóng gói JS cho Android đều đạt.

## Theo dõi người thử (cập nhật dần)

Điều kiện lên bản chính thức: **ít nhất 12 người thử tham gia liên tục 14 ngày**.

| Ngày | Số người thử đã tham gia | Góp ý nhận được | Ghi chú |
|---|---|---|---|
| 06/11/2026 | 12 người tham gia liên tục 9 ngày (đủ 2/3 điều kiện) | | 35 lượt thu nạp, 18 thiết bị cài lần đầu, 16 thiết bị hoạt động (28 ngày) |
| 09/11/2026 | 12 người tham gia liên tục 12 ngày | 4 góp ý (#21, #54, #79, #97) cùng báo thanh tab bị thanh điều hướng của máy đè, khó bấm. Đã sửa ở bản 7. 2 góp ý (#59, #96) báo bàn phím che ô nhập và nút gửi. Đã sửa ở bản 7 | Dự kiến đủ 14 ngày vào 11/11. 64 lượt thu nạp, 49 thiết bị mở lần đầu, 39 thiết bị hoạt động hằng tháng |

## Bài học rút ra

- versionCode (Google Play dùng) và versionName (người dùng thấy) là hai số khác nhau. Chỉ tăng versionCode thì người thử tưởng app không cập nhật, nên mỗi bản cần tăng cả versionName.

- Tài khoản cá nhân không được phát hành ứng dụng thuộc nhóm Y tế. Cần phân loại
  tính năng ngay từ đầu, trước khi khai báo.
- Dùng cờ tính năng (feature flag) để có hai cấu hình: bản Play rút gọn và bản demo
  đầy đủ, không phải tách code.
- Tính năng cần API mới thì phải deploy backend trước, rồi mới build và phát hành app.
- Máy ảo không được các app test chéo tính, nên vẫn cần người thử dùng điện thoại
  Android thật.
