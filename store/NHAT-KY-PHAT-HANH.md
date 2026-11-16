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
| 16/11/2026 | (trang cửa hàng) | Viết lại mô tả VI/EN cho khớp 5 mục Sức khỏe & thể chất đã khai, thêm câu miễn trừ "không phải thiết bị y tế" (xem store/mo-ta-cua-hang-v2.md) | Đã lưu trên Play Console, chưa gửi |
| 16/11/2026 | 8 (1.1.1) | Đổi chữ trong app cho khớp tờ khai sức khỏe: bỏ "thụ thai / chuẩn bị mang thai", "phục hồi sau sinh", "triệu chứng / bệnh lý" | Code xong, chờ commit và build |

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
- **Rủi ro còn lại:** kết quả AI vẫn có mức độ (Thấp, Trung bình, Cao, Khẩn cấp) và nút gọi 115 khi khẩn cấp. Nhóm giữ lại vì an toàn cho người dùng.

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
