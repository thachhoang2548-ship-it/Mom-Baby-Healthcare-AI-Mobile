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

## Theo dõi người thử (cập nhật dần)

Điều kiện lên bản chính thức: **ít nhất 12 người thử tham gia liên tục 14 ngày**.

| Ngày | Số người thử đã tham gia | Góp ý nhận được | Ghi chú |
|---|---|---|---|
| | | | |

## Bài học rút ra

- Tài khoản cá nhân không được phát hành ứng dụng thuộc nhóm Y tế. Cần phân loại
  tính năng ngay từ đầu, trước khi khai báo.
- Dùng cờ tính năng (feature flag) để có hai cấu hình: bản Play rút gọn và bản demo
  đầy đủ, không phải tách code.
- Tính năng cần API mới thì phải deploy backend trước, rồi mới build và phát hành app.
- Máy ảo không được các app test chéo tính, nên vẫn cần người thử dùng điện thoại
  Android thật.
