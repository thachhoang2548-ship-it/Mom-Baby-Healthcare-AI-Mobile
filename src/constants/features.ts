// Tài khoản Google Play cá nhân không được phát hành app y tế (Play Console Requirements),
// nên bản hiện tại tắt các tính năng thuộc nhóm "Y tế": khảo sát EPDS, lịch trình IVF, trang Khẩn cấp
// và danh sách bệnh có thể gặp trong kết quả AI. Bật lại khi app chuyển sang tài khoản tổ chức.
export const MEDICAL_FEATURES_ENABLED = false;

// Google Play xếp nội dung mang thai vào mục "Sức khỏe sinh sản và tình dục" (nhóm Y tế),
// mà nhóm Y tế chỉ được phát hành từ tài khoản tổ chức (bị từ chối 19/11/2026).
// Bản Play tắt giai đoạn Mang thai và Sau sinh: mọi người dùng thấy nội dung Theo dõi chu kỳ,
// cùng các phần bé, dinh dưỡng, vận động, giấc ngủ, thư giãn. Bật lại khi có tài khoản tổ chức.
export const PREGNANCY_FEATURES_ENABLED = false;

// Chuyên viên chính sách Google Play (email 20/11/2026) yêu cầu bỏ cả "mood logging" khỏi bản phát hành
// từ tài khoản cá nhân. Bản Play ẩn phần ghi tâm trạng ở Tổng quan và Nhật ký hằng ngày.
export const MOOD_LOG_ENABLED = false;

// Dự đoán ngày rụng trứng / cửa sổ dễ thụ thai có thể bị Google xếp vào "Sức khỏe sinh sản" (nhóm Y tế).
// Bản Play chỉ theo dõi kỳ kinh: lịch đánh dấu kỳ kinh dự kiến và đếm ngày đến kỳ kinh tiếp theo.
export const OVULATION_ENABLED = false;
