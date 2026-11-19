// Tài khoản Google Play cá nhân không được phát hành app y tế (Play Console Requirements),
// nên bản hiện tại tắt các tính năng thuộc nhóm "Y tế": khảo sát EPDS, lịch trình IVF, trang Khẩn cấp
// và danh sách bệnh có thể gặp trong kết quả AI. Bật lại khi app chuyển sang tài khoản tổ chức.
export const MEDICAL_FEATURES_ENABLED = false;

// Google Play xếp nội dung mang thai vào mục "Sức khỏe sinh sản và tình dục" (nhóm Y tế),
// mà nhóm Y tế chỉ được phát hành từ tài khoản tổ chức (bị từ chối 19/11/2026).
// Bản Play tắt giai đoạn Mang thai và Sau sinh: mọi người dùng thấy nội dung Theo dõi chu kỳ,
// cùng các phần bé, dinh dưỡng, vận động, giấc ngủ, thư giãn. Bật lại khi có tài khoản tổ chức.
export const PREGNANCY_FEATURES_ENABLED = false;
