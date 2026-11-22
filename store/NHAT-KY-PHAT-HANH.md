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
| 09/11/2026 | 7 (1.1.0) | Sửa thanh tab và bàn phím theo góp ý, màu theo giới tính bé, màn Cài đặt, tiếng Anh toàn bộ | Được duyệt, phát hành cho người thử 09/11 19:23 |
| 11/11/2026 | (tài khoản) | Gửi đơn xin quyền phát hành công khai (production) | **Được duyệt** 12/11/2026 lúc 05:12, khoảng 16 giờ sau khi nộp. Email "Your app has been granted Google Play production access" |
| 12/11/2026 | 7 (1.1.0) – Phát hành công khai | Bản chính thức đầu tiên, phát hành 100%, tất cả quốc gia (177 quốc gia/khu vực và các nơi khác trên thế giới) | **Bị từ chối** 16/11: "Inaccurate Health Apps Declaration" (mô tả cửa hàng có nội dung sức khỏe sinh sản, mục thuộc nhóm Y tế) |
| 16/11/2026 | (trang cửa hàng) | Viết lại mô tả VI/EN cho khớp 5 mục Sức khỏe & thể chất đã khai, thêm câu miễn trừ "không phải thiết bị y tế" (xem store/mo-ta-cua-hang-v2.md) | Gửi xem xét 16/11 cùng bản 8 |
| 16/11/2026 | 8 (1.1.1) | Đổi chữ trong app cho khớp tờ khai sức khỏe: bỏ "thụ thai / chuẩn bị mang thai", "phục hồi sau sinh", "triệu chứng / bệnh lý" | Build EAS 16/11 (commit ac0ae8d). Gửi xem xét 16/11 cùng mô tả cửa hàng mới, kênh Phát hành công khai, tất cả quốc gia. **Bị từ chối** 18/11, cùng lỗi "Inaccurate Health Apps Declaration" |
| 18/11/2026 | (tờ khai sức khỏe) | Khai thêm mục **Sức khỏe sinh sản và tình dục** (nhóm Y tế) vì app có theo dõi thai kỳ. Giữ 5 mục cũ, không thêm mục nào khác | Gửi xem xét 18/11. **Bị từ chối** 19/11: "Play Console Requirements", khai mục Y tế thì phải dùng tài khoản tổ chức |
| 20/11/2026 | 9 (1.2.0) – bản Play không có phần mang thai | Cờ `PREGNANCY_FEATURES_ENABLED = false` ẩn giai đoạn Mang thai và Sau sinh. Tờ khai quay về 5 mục Sức khỏe & thể dục. Mô tả v3 (store/mo-ta-cua-hang-v3.md). Song song gửi câu hỏi cho chuyên viên chính sách Google | Không tải lên (còn ghi tâm trạng) |
| 21/11/2026 | 10 (1.2.0) | Theo email chuyên viên Google: bỏ thêm ghi tâm trạng và Lịch chăm sóc | Không tải lên (server còn trả nội dung thụ thai) |
| 21/11/2026 | 11 (1.2.0) + backend | App gửi header `X-App-Edition: play`; server bỏ nội dung thụ thai cho bản Play (AI, thông báo BR01, lời khuyên chu kỳ, món ăn AI) | Không tải lên (còn dự đoán rụng trứng) |
| 21/11/2026 | 12 (1.2.1) | Bỏ dự đoán rụng trứng (cờ `OVULATION_ENABLED = false`): màn "Chu kỳ kinh nguyệt" chỉ đếm ngày đến kỳ kinh tiếp theo. Mô tả cửa hàng bỏ chữ rụng trứng | Gửi duyệt Production 21/11 (đang chờ Google) |

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

### 09/11/2026 – Bản 7 (1.1.0)

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

### 16/11/2026 – Bị từ chối bản công khai, chuẩn bị bản 8 (1.1.1)

- **Email từ chối:** "Inaccurate Health Apps Declaration". Google liệt kê 6 mục cần kiểm tra, gồm 5 mục đã khai và **Reproductive and Sexual Health**. Nơi phát hiện là **Mô tả đầy đủ**. Cách sửa Google gợi ý: cập nhật tờ khai.
- **Vì sao không khai thêm mục đó:**
  - Reproductive and Sexual Health thuộc nhóm **Medical**.
  - Chính sách Play Console Requirements ghi: *"developers providing the following services must register as an Organization: Health apps, such as Medical apps…"*.
  - Tài khoản cá nhân khai mục Y tế thì bị từ chối như bản 3.
  - Vì vậy nhóm sửa cho app và mô tả không còn nội dung thuộc sức khỏe sinh sản.
- **Theo Google, mục Period Tracking bao gồm** "ovulation tracking and prediction, and fertility awareness". Chu kỳ và rụng trứng vẫn nằm trong mục đã khai.
- **Sửa mô tả cửa hàng (VI + EN):**
  - Chia theo 5 mục đã khai.
  - Bỏ "chuẩn bị mang thai / trying to conceive", "sau sinh phục hồi", "gọi 115".
  - Thêm câu bắt buộc "không phải thiết bị y tế, không chẩn đoán, điều trị, chữa khỏi hay phòng ngừa bệnh".
  - Toàn văn ở `store/mo-ta-cua-hang-v2.md`.
- **Sửa chữ trong app (bản 1.1.1), chỉ đổi chữ hiển thị, không đổi tính năng hay dữ liệu gửi server:**
  - **Giai đoạn "Chuẩn bị mang thai / Trying to conceive"** thành "Theo dõi chu kỳ / Cycle tracking". "Ngày dễ thụ thai / cửa sổ thụ thai" thành "ngày rụng trứng / quanh ngày rụng trứng".
  - **"Phục hồi sau sinh / Hậu sản / Recovery"** thành "Mẹ sau sinh", "Vận động nhẹ & chăm bé". Tên giai đoạn "phục hồi vết thương" thành "Tuần 2 - 6 sau sinh". Không hiện tên giai đoạn do server trả về.
  - **Tab AI:** gợi ý nhanh đổi từ triệu chứng ("thai máy ít hơn", "bé sốt") sang câu hỏi chăm sóc (ăn dặm, giấc ngủ, vận động). Câu hỏi và ví dụ mẫu đổi tương tự. Bỏ chữ "triệu chứng" ở nút chụp ảnh và lịch sử.
  - **Hồ sơ:** "Tiền sử bệnh / được chẩn đoán tiểu đường thai kỳ" thành "Lưu ý sức khỏe cho thực đơn / cần thực đơn ít đường". Nhật ký đổi "Triệu chứng" thành "Cảm giác khó chịu".
  - Typecheck, lint, đóng gói Android đều đạt. Version 1.1.1.
- **Đã kiểm tra trước khi gửi:** tờ khai sức khỏe đúng 5 mục Sức khỏe & thể chất, không mục Y tế nào. Cảnh báo duy nhất là thiếu tệp gỡ rối R8.
- **Việc cần làm sau (không gấp):** Play Console báo "Mức độ tối ưu hóa mã DEX thấp" (làm rối 1%), hạn sửa tháng 2/2027. Cách xử lý: bật R8/minify trong cấu hình build Android (expo-build-properties).
- **Rủi ro còn lại:** kết quả AI vẫn có mức độ (Thấp, Trung bình, Cao, Khẩn cấp) và nút gọi 115 khi khẩn cấp. Nhóm giữ lại vì an toàn cho người dùng.

### 18/11/2026 – Bị từ chối lần 2, khai thêm mục Sức khỏe sinh sản

- **Email từ chối:** vẫn là "Inaccurate Health Apps Declaration", vẫn 6 mục cần kiểm tra như lần trước. Nơi phát hiện là **mô tả đầy đủ mới (v2)**. Mô tả này đã bỏ hết "thụ thai, sinh sản, phục hồi, triệu chứng" nhưng vẫn bị.
- **Kết luận:** Google không bắt từ ngữ. Họ xếp nội dung **mang thai** (theo dõi thai kỳ, mẹ bầu, sau sinh) vào **Reproductive and Sexual Health**. Đây là tính năng chính của app nên không thể bỏ.
- **Rà lại 6 mục so với tính năng thật trong app:**
  - Hoạt động và thể dục: kế hoạch vận động, ghi bước chân.
  - Cân nặng và dinh dưỡng: cân nặng thai kỳ, thực đơn, biểu đồ WHO.
  - Theo dõi chu kỳ: lịch chu kỳ, ngày rụng trứng.
  - Giấc ngủ: ghi giờ ngủ.
  - Thư giãn: nhạc, bài thở, tâm trạng.
  - Sức khỏe sinh sản: theo dõi thai kỳ theo tuần, giai đoạn sau sinh.
  - Cả 6 đều có thật nên khai đủ 6. Bỏ mục nào cũng làm tờ khai sai.
- **Đã làm:** tick thêm "Sức khoẻ sinh sản và tình dục" và giữ 5 mục cũ. Bước 2 "Yêu cầu theo khu vực" không cần khai gì. Lưu tờ khai.
- **Rủi ro:** bản 3 bị từ chối vì đòi tài khoản tổ chức, lần đó tờ khai có 7 mục Y tế. Trang Play Console Requirements chỉ ghi *"Health apps, such as Medical apps"*. Trang định nghĩa ứng dụng y tế lấy ví dụ hồ sơ bệnh án, khám từ xa, quản lý bệnh, kiểm tra triệu chứng. App nhật ký mẹ bầu không thuộc nhóm đó, nhưng vẫn có thể bị đòi tài khoản tổ chức.

### 19–20/11/2026 – Bị từ chối lần 3, làm bản Play không có phần mang thai (bản 9, 1.2.0)

- **Email từ chối 19/11:** "Vi phạm yêu cầu của Play Console". *"Bạn đã chọn một danh mục ứng dụng hoặc khai báo rằng ứng dụng của bạn cung cấp một số tính năng nhất định, yêu cầu bạn phải gửi ứng dụng bằng tài khoản tổ chức."* Khu vực: Tài khoản nhà phát triển.
- **Kết luận:**
  - App bị kẹt giữa hai lỗi. Không khai Sức khỏe sinh sản thì tờ khai "không chính xác". Có khai thì bị đòi tài khoản tổ chức.
  - Tài khoản cá nhân không phát hành được app có nội dung mang thai.
  - Ngay cả 1 mục Y tế cũng kéo theo yêu cầu tài khoản tổ chức.
- **Google gửi thêm email "Personalized guidance"** có nút Request support để hỏi chuyên viên chính sách. Nhóm gửi câu hỏi: app nhật ký thai kỳ không có chức năng y tế thì có bắt buộc khai Sức khỏe sinh sản không, và cần bỏ gì để tài khoản cá nhân phát hành được. **Đã gửi 20/11/2026**, kèm ảnh 2 email từ chối. Chờ chuyên viên trả lời.
- **Hướng xử lý chính (do hạn present 27/11):** làm bản Play không có phần mang thai.
  - Thêm cờ `PREGNANCY_FEATURES_ENABLED = false` trong `src/constants/features.ts`.
  - `getStageIndex()` luôn trả về giai đoạn Theo dõi chu kỳ, nên mọi màn đều hiện nội dung chu kỳ.
  - Ẩn ô Thai kỳ, Sau sinh ở Menu. Ẩn phần chọn giai đoạn ở Hồ sơ. Ẩn khung "Các chặng đường" ở Lộ trình.
  - Đổi ảnh mẹ bầu sang ảnh khác ở Tổng quan, Lộ trình và trang chào.
  - Trang chào, trợ lý AI, Món ăn AI (bỏ chế độ ăn mẹ bầu / sau sinh / tiểu đường thai kỳ), Cài đặt và Lịch chăm sóc bỏ chữ về thai kỳ.
  - Code màn Mang thai, Sau sinh vẫn giữ nguyên. Có tài khoản tổ chức thì chỉ cần bật cờ.
  - Typecheck, lint và đóng gói Android đều đạt. Version 1.2.0.
- **Trên Play Console cần làm:**
  - Tờ khai sức khỏe bỏ tick Sức khỏe sinh sản, giữ 5 mục.
  - Mô tả v3.
  - Thay ảnh chụp màn hình 1, 2, 4 vì có chữ "hậu sản", "Thai kỳ", "Ốm nghén", "triệu chứng". Ảnh 3 (Bé yêu) giữ lại.
  - Phát hành bản 9.
- **Lưu ý:**
  - Tài khoản thử cho Google nên để giai đoạn Theo dõi chu kỳ. Lịch chăm sóc lấy nội dung từ server theo giai đoạn đã lưu.
  - Bản đầy đủ (có phần mang thai) dùng để demo khi present bằng bản dev hoặc APK nội bộ, chỉ cần bật cờ.
- **Trợ lý AI trong biểu mẫu hỗ trợ (20/11) xác nhận hướng này:**
  - Tài khoản cá nhân phát hành được nếu bỏ hết tính năng mang thai, sau sinh và chỉ khai các mục Sức khỏe & thể dục.
  - Phải bỏ chữ mang thai khỏi tên, mô tả ngắn và mô tả đầy đủ.
  - Phải thay ảnh chụp màn hình và ảnh quảng bá có hình mang thai.
  - Phải bỏ các màn mang thai khỏi app.
  - Phải giữ câu miễn trừ y tế.
  - Phát hành bản mới với versionCode tăng.
- **Làm thêm theo góp ý đó:**
  - Khi cờ tắt, các màn Mang thai, Sau sinh, EPDS, Thực đơn thai kỳ, Bài tập thai kỳ không được đăng ký trong điều hướng nên không mở được.
  - **Đổi biểu tượng app** từ hình mẹ bầu sang chữ "M" trong trái tim hồng. File mới là `assets/*-v2.png`, logo cũ vẫn giữ trong `assets/`.
  - Ảnh bìa cửa hàng mới chỉ có chữ: `store/play-feature-graphic-v2-1024x500.png`. Icon cửa hàng mới: `store/play-icon-v2-512.png`.
  - Câu xin quyền ảnh và máy ảnh bỏ chữ "ảnh triệu chứng".

### 20–21/11/2026 – Chuyên viên Google trả lời, bản 10 (1.2.0) bỏ thêm ghi tâm trạng

- **Email "Google Play Policy Support" (case 3-8662000041345, 20/11 lúc 14:12)** trả lời 3 câu hỏi:
  1. Nhật ký thai kỳ **có** phải khai Reproductive and Sexual Health. Lý do: theo dõi tiến trình thai kỳ, mốc theo tuần, sự phát triển của thai nhi hay phục hồi sau sinh đều thuộc mục này, kể cả khi app chỉ là nhật ký và đã ghi không phải thiết bị y tế.
  2. Tài khoản cá nhân **được** phát hành nếu bỏ hết tính năng theo dõi mang thai và sau sinh, chỉ khai các mục Health & Fitness.
  3. Họ chỉ ra cụ thể phần cần tài khoản tổ chức: *"pregnancy stage tracking, related exercises, and mood logging"*. Muốn giữ tài khoản cá nhân thì phải bỏ hẳn các phần này khỏi app và trang cửa hàng.
- **Bản 9 đã làm** phần mang thai và bài tập thai kỳ. Bản 9 chưa tải lên Play.
- **Bản 10 làm thêm:**
  - Cờ `MOOD_LOG_ENABLED = false` ẩn phần ghi tâm trạng ở Tổng quan (thẻ tâm trạng và hàng 5 biểu cảm) và ở Nhật ký hằng ngày.
  - Ẩn Lịch chăm sóc vì là checklist server trả theo giai đoạn.
  - Bỏ chữ "tâm trạng" ở trang chào, Lộ trình và mô tả v3.
  - Bỏ ô triệu chứng "Thay đổi tâm trạng" ở màn ghi kỳ kinh.
  - Typecheck và lint đạt.
- **Build 21/11:** commit 2cae903, versionCode 10. EAS build xong cả file .aab (store/mom-oi-build10.aab) và APK thử (store/mom-oi-build10-preview.apk).
- **Kiểm tra bản 10 trên máy ảo (21/11) phát hiện server vẫn trả nội dung thụ thai** cho giai đoạn 0 (server gọi là `PrePregnancy`):
  - Trợ lý AI khuyên "chuẩn bị trước khi mang thai", "acid folic trước khi mang thai", vì prompt gửi giai đoạn PrePregnancy.
  - Màn Chu kỳ hiện câu "cửa sổ thụ thai vàng".
  - Quy tắc BR01 đẩy thông báo "Cửa sổ thụ thai tối ưu" kèm gợi ý tăng cơ hội mang thai.
  - Món ăn AI dùng prompt "dinh dưỡng cho mẹ bầu".
- **Cách sửa (bản 11 + backend):**
  - App gửi header `X-App-Edition: play` khi `PREGNANCY_FEATURES_ENABLED = false`.
  - Backend thêm `IAppEditionContext`. Khi có header này: prompt AI không gửi giai đoạn và cấm nhắc mang thai/thụ thai, không tạo BR01, lời khuyên chu kỳ trung tính, món ăn AI cho "phụ nữ và gia đình".
  - Web không gửi header nên giữ nguyên nội dung cũ.
  - App tự thay lời khuyên server ở màn Chu kỳ bằng câu trung tính (phòng khi server chưa deploy).
  - Backend build đạt, 48/48 test (thêm test BR01 không chạy ở bản Play).
  - 21/11: backend rebase lên 6 commit mới của nhóm (ảnh bé, bác sĩ gọi lại), 67/67 test, push commit `43fae06`; Railway deploy xong.
  - 21/11: app push commit `8b7db81`, chạy EAS build bản 11 (production .aab + preview APK).
  - 21/11: build xong, `store/mom-oi-build11.aab` (1.2.0, versionCode 11) và `store/mom-oi-build11-preview.apk`. Cài APK lên máy ảo Pixel_7:
    - Màn Chu kỳ hiện lời khuyên trung tính.
    - Hỏi AI "Mẹ nên ăn gì để đỡ mệt?": không còn chữ mang thai / mẹ bầu / thụ thai / rụng trứng.
  - 21/11: AI trả về dấu `**` (Markdown) hiện nguyên văn. Backend commit `afaf960`: dặn AI trả văn bản thuần và server tự xoá `**`. Đã kiểm tra lại trên máy ảo.
  - Ảnh Play mới, đã cắt thanh trạng thái và thêm lề cho tỉ lệ 9:16 như bộ ảnh cũ: `play-v3-1-tong-quan.png`, `play-v3-2-chu-ky.png`, `play-v3-3-ai.png`, `play-v3-4-lo-trinh.png`. Ảnh thứ 5 dùng lại `play-phone-3.png` (Bé yêu).
- **Bản 12 (1.2.1), 21/11:**
  - Người dùng đồng ý bỏ dự đoán rụng trứng vì có thể bị xếp vào Sức khỏe sinh sản.
  - App commit `ec27a11`: thêm cờ `OVULATION_ENABLED = false`, đổi tên màn thành Chu kỳ kinh nguyệt, lịch chỉ đánh dấu kỳ kinh dự kiến, thẻ Còn N ngày đến kỳ kinh. Sửa chữ ở Tổng quan, Lộ trình, Hồ sơ, Trang khách.
  - Backend commit `293b7ac`: `ovulation-today` trả thêm `DaysUntilNextPeriod`.
  - Mô tả v3: bỏ dòng rụng trứng; đổi cảm giác đi kèm / how you feel thành biểu hiện như đau bụng, mệt mỏi.
  - Kiểm tra trên máy ảo: Tổng quan, Chu kỳ (Còn 9 ngày, khớp 30/11), Lộ trình, Menu không còn chữ rụng trứng. Chụp lại ảnh 1, 2, 4.
  - **Gửi duyệt 21/11 (Production, 11 thay đổi):**
    - Bản 12 (1.2.1) phát hành đầy đủ; bản 8 không đi kèm.
    - Tờ khai sức khỏe: bỏ tick Sức khỏe sinh sản và tình dục (trước đó vẫn còn tick), giữ 5 mục Sức khỏe & thể dục.
    - Trang cửa hàng vi + en-US: mô tả v3, icon v2, ảnh bìa v2, 5 ảnh chụp (play-v3-1..4 + play-phone-3).
    - Gắn nhãn AI cho 3 ảnh có hình do AI tạo (Tổng quan, Lộ trình, Bé yêu), theo xác nhận của người dùng.
    - Bỏ qua cảnh báo android.hardware.screen.portrait (app chỉ dùng màn hình dọc), lý do: xuất bản thay đổi quan trọng hơn.
    - Lưu ý: nút Lưu dưới dạng bản nháp chỉ lưu nháp; phải bấm Tiếp theo rồi Lưu thì trang cửa hàng mới vào danh sách gửi.
  - **22/11 21:55:** email Google Play Developer Support (James) xác nhận bản 12 đang được xét duyệt sau lần từ chối trước; có thể mất 7 ngày hoặc lâu hơn. Yêu cầu không gửi thêm phiên bản nào cho đến khi xét duyệt xong.
- **Tờ khai:** giữ 5 mục Health & Fitness, theo câu trả lời số 2 của chuyên viên. Mục Thư giãn vẫn đúng vì còn nhạc thư giãn và bài thở.

## Theo dõi người thử (cập nhật dần)

Điều kiện lên bản chính thức: **ít nhất 12 người thử tham gia liên tục 14 ngày**.

| Ngày | Số người thử đã tham gia | Góp ý nhận được | Ghi chú |
|---|---|---|---|
| 06/11/2026 | 12 người tham gia liên tục 9 ngày (đủ 2/3 điều kiện) | | 35 lượt thu nạp, 18 thiết bị cài lần đầu, 16 thiết bị hoạt động (28 ngày) |
| 09/11/2026 | 12 người tham gia liên tục 12 ngày | 4 góp ý (#21, #54, #79, #97) cùng báo thanh tab bị thanh điều hướng của máy đè, khó bấm. Đã sửa ở bản 7. 2 góp ý (#59, #96) báo bàn phím che ô nhập và nút gửi. Đã sửa ở bản 7 | Dự kiến đủ 14 ngày vào 11/11. 64 lượt thu nạp, 49 thiết bị mở lần đầu, 39 thiết bị hoạt động hằng tháng |

## Đơn xin phát hành công khai

- **11/11/2026:** Play Console báo đủ cả 3 điều kiện: có bản thử nghiệm khép kín, có ít nhất 12 người thử, chạy liên tục 14 ngày.
- **Bản 7 (1.1.0):** được duyệt và phát hành cho người thử lúc 19:23 ngày 09/11/2026.
- **Số liệu 28 ngày đến 11/11:**
  - 51 người thử đang tham gia.
  - 65 lượt thu nạp.
  - 52 thiết bị mở lần đầu.
  - 42 thiết bị hoạt động hằng tháng.

### Tổng hợp 98 góp ý của người thử (27/10 – 09/11)

- **Đa số là khen hoặc xác nhận đã test** ("ok", "app mượt", "app có ý nghĩa"…). #81 mô tả kiểm thử chi tiết: đăng nhập bằng tài khoản thử, mở Tổng quan, Lộ trình, Menu, phát nhạc thư giãn, đồng hồ đếm ngược chạy đúng.
- **Lỗi đã sửa ở bản 7:**
  - Thanh tab bị thanh điều hướng che (#21, #54, #79, #97).
  - Bàn phím che ô nhập và nút gửi (#59, #96).
  - Giao diện hơi rối (#88): làm gọn thẻ ghi nhận trong ngày.
- **Đã xử lý trước đó:** mở kênh cho mọi quốc gia (#65, ngày 01/11).
- **Chưa xử lý, đưa vào kế hoạch bản sau:**
  - Nút đăng nhập hơi mờ (#96).
  - Một người đăng ký xong không đăng nhập được (#11), cần kiểm tra.
  - Đăng nhập bằng Google (#69).
  - Chọn nhiều cảm xúc cùng lúc (#19).
  - Nút dùng thử không cần đăng nhập (#94).

- **12/11/2026 05:12:** Google cấp quyền phát hành công khai.
- **12/11/2026:** tạo bản phát hành chính thức trên kênh Phát hành công khai. Dùng lại gói 7 (1.1.0) từ thư viện, không build mới. Phát hành 100%, tất cả quốc gia. Ghi chú phát hành viết cho người dùng mới (tiếng Việt và tiếng Anh), khác ghi chú dành cho tester. Đã gửi 3 thay đổi để Google xem xét.

### Câu trả lời đã gửi (11/11/2026)

**Bước 1 – Thử nghiệm khép kín**
- **Tuyển người thử thế nào?** We joined a Vietnamese cross-testing community of Android developers (a Google Group) and posted a request for testers there. Friends with real Android phones also joined. We opened the track to all countries so testers outside Vietnam could install the app.
- **Tuyển có dễ không?** Bình thường.
- **Người thử dùng app ra sao?** 51 testers opted in and left 98 notes over 14 days (Oct 27 - Nov 9). They used sign-up, daily check-in, baby profiles and meal ideas, AI care tips, vitamins, cycle tracking and Relax audio. 28 days to Nov 11: 65 installs, 52 first opens, 42 monthly active devices.
- **Tóm tắt góp ý:** Testers sent daily notes in the cross-testing app and group chat (98 total, mostly positive). Issues: tab bar under the phone nav bar (4), keyboard hiding input/send (2), busy UI, faint login button, one sign-in failure after sign-up. Requests: Google sign-in, multi-select mood, guest demo.

**Bước 2 – Về ứng dụng**
- **Đối tượng:** Adults 18+ in Vietnam, mainly women who are trying to conceive, pregnant, or caring for a newborn and young baby, plus family members who support them. The app is in Vietnamese and English.
- **Lợi ích:** One place for everyday mother and baby care: daily check-in (water, mood, sleep), cycle and pregnancy week tracking, vitamin reminders, baby profiles with growth charts and age-appropriate meal ideas, and AI care tips that always say they do not replace a doctor.
- **Lượt cài năm đầu:** 0 – 10 nghìn.

**Bước 3 – Sẵn sàng phát hành**
- **Đã thay đổi gì?** 4 releases in the 14-day test: Oct 27 first build; Nov 1 name editing and opened to all countries; Nov 6 English UI and clearer offline/error screens; Nov 9 v1.1.0 fixed tab bar under phone nav bar and keyboard hiding inputs, simpler check-in, Settings. Next: login fixes, Google sign-in.
- **Vì sao đã sẵn sàng?** We shipped an update every 3-5 days based on tester notes, and the layout bugs several testers reported are fixed in 1.1.0 (live since Nov 9). 51 testers stayed opted in for 14 days; monthly active devices reached 42. Store listing and policy declarations are complete.

## Bài học rút ra

- Khi email từ chối liệt kê một mục cần khai, sửa từ ngữ để né thường không đủ. Nếu app thật sự có tính năng đó (ở đây là theo dõi thai kỳ) thì khai đúng mục Google chỉ ra.

- Lần duyệt bản công khai xét cả mô tả cửa hàng so với tờ khai sức khỏe, kỹ hơn lần duyệt thử nghiệm. Mô tả nhắc "chuẩn bị mang thai, theo dõi thai kỳ" bị coi là Reproductive and Sexual Health (nhóm Y tế), dù cùng mô tả đó vẫn qua duyệt ở kênh thử nghiệm. Theo Google, rụng trứng và cửa sổ thụ thai thuộc Period Tracking. Mô tả phải dùng đúng từ ngữ của các mục đã khai và có câu "không phải thiết bị y tế".

- Câu "Vì sao app sẵn sàng phát hành" trong đơn xin production nên khẳng định thẳng (đã sửa hết, ổn định, sẵn sàng). Không nên nêu việc chưa làm, vì Google có thể yêu cầu thử thêm 14 ngày. Kế hoạch sau phát hành có thể làm sau khi đã lên production. Đây là góp ý của một anh trong cộng đồng test chéo sau khi nhóm đã nộp đơn ngày 11/11.

- versionCode (Google Play dùng) và versionName (người dùng thấy) là hai số khác nhau. Chỉ tăng versionCode thì người thử tưởng app không cập nhật, nên mỗi bản cần tăng cả versionName.

- Tài khoản cá nhân không được phát hành ứng dụng thuộc nhóm Y tế. Cần phân loại
  tính năng ngay từ đầu, trước khi khai báo.
- Dùng cờ tính năng (feature flag) để có hai cấu hình: bản Play rút gọn và bản demo
  đầy đủ, không phải tách code.
- Tính năng cần API mới thì phải deploy backend trước, rồi mới build và phát hành app.
- Máy ảo không được các app test chéo tính, nên vẫn cần người thử dùng điện thoại
  Android thật.
