// Bộ câu hỏi EPDS giống web (EpdsPage.jsx). Điểm mỗi câu 0-3, tổng 0-30.
export const EPDS_QUESTIONS: { text: string; options: { label: string; score: number }[] }[] = [
  {
    text: 'Tôi có thể cười và nhìn thấy mặt tốt của mọi thứ...',
    options: [
      { label: 'Như thường lệ', score: 0 },
      { label: 'Ít hơn trước một chút', score: 1 },
      { label: 'Chắc chắn ít hơn trước nhiều', score: 2 },
      { label: 'Không hề', score: 3 },
    ],
  },
  {
    text: 'Tôi mong đợi mọi việc một cách vui vẻ...',
    options: [
      { label: 'Như trước đây', score: 0 },
      { label: 'Ít hơn trước đây một chút', score: 1 },
      { label: 'Chắc chắn ít hơn trước đây nhiều', score: 2 },
      { label: 'Hầu như không', score: 3 },
    ],
  },
  {
    text: 'Tôi đổ lỗi cho bản thân một cách không cần thiết khi mọi việc diễn ra không thuận lợi...',
    options: [
      { label: 'Phần lớn thời gian', score: 3 },
      { label: 'Đôi khi', score: 2 },
      { label: 'Hiếm khi', score: 1 },
      { label: 'Không bao giờ', score: 0 },
    ],
  },
  {
    text: 'Tôi lo lắng hoặc băn khoăn mà không có lý do chính đáng...',
    options: [
      { label: 'Không hề', score: 0 },
      { label: 'Đôi khi', score: 1 },
      { label: 'Thường xuyên', score: 2 },
      { label: 'Rất thường xuyên', score: 3 },
    ],
  },
  {
    text: 'Tôi cảm thấy sợ hãi hoặc hoảng sợ mà không có lý do chính đáng...',
    options: [
      { label: 'Có, khá nhiều', score: 3 },
      { label: 'Có, đôi khi', score: 2 },
      { label: 'Không, không nhiều lắm', score: 1 },
      { label: 'Không, không hề', score: 0 },
    ],
  },
  {
    text: 'Mọi việc dường như quá tải đối với tôi...',
    options: [
      { label: 'Có, hầu hết thời gian tôi không thể đối phó', score: 3 },
      { label: 'Có, đôi khi tôi không thể đối phó tốt như trước', score: 2 },
      { label: 'Không, hầu hết thời gian tôi đều đối phó tốt', score: 1 },
      { label: 'Không, tôi vẫn đối phó tốt như trước đây', score: 0 },
    ],
  },
  {
    text: 'Tôi cảm thấy không hạnh phúc đến mức khó ngủ...',
    options: [
      { label: 'Có, hầu hết thời gian', score: 3 },
      { label: 'Có, thường xuyên', score: 2 },
      { label: 'Hiếm khi', score: 1 },
      { label: 'Không hề', score: 0 },
    ],
  },
  {
    text: 'Tôi cảm thấy buồn bã hoặc tồi tệ...',
    options: [
      { label: 'Có, hầu hết thời gian', score: 3 },
      { label: 'Có, khá thường xuyên', score: 2 },
      { label: 'Thỉnh thoảng', score: 1 },
      { label: 'Không hề', score: 0 },
    ],
  },
  {
    text: 'Tôi cảm thấy không hạnh phúc đến mức khóc...',
    options: [
      { label: 'Có, hầu hết thời gian', score: 3 },
      { label: 'Có, khá thường xuyên', score: 2 },
      { label: 'Chỉ thỉnh thoảng', score: 1 },
      { label: 'Không hề', score: 0 },
    ],
  },
  {
    text: 'Ý nghĩ làm hại bản thân đã xuất hiện trong tâm trí tôi...',
    options: [
      { label: 'Có, khá thường xuyên', score: 3 },
      { label: 'Đôi khi', score: 2 },
      { label: 'Hầu như không bao giờ', score: 1 },
      { label: 'Không bao giờ', score: 0 },
    ],
  },
];

/** Cùng ngưỡng với backend (BusinessRuleEngine.EvaluateEpdsScore). */
export function epdsRisk(score: number) {
  if (score >= 13) {
    return {
      label: 'Nguy cơ cao',
      color: '#B42318',
      bg: '#FEE4E2',
      advice:
        'Mẹ có nguy cơ trầm cảm sau sinh cao. Mẹ hãy liên hệ bác sĩ hoặc chuyên gia tâm lý sớm và chia sẻ với người thân.',
    };
  }
  if (score >= 9) {
    return {
      label: 'Cần lưu ý',
      color: '#C97842',
      bg: '#FFF4EB',
      advice:
        'Mẹ có một vài dấu hiệu cần để ý. Hãy nghỉ ngơi nhiều hơn, nhờ người thân hỗ trợ và làm lại khảo sát sau 1-2 tuần.',
    };
  }
  return {
    label: 'Ổn định',
    color: '#5F7A6B',
    bg: '#E8F2EC',
    advice: 'Tâm lý của mẹ đang ổn định. Tiếp tục giữ lối sống lành mạnh và chia sẻ cùng gia đình nhé.',
  };
}

/** Câu 10 hỏi về ý nghĩ tự làm hại bản thân: bất kỳ câu trả lời khác "Không bao giờ" đều cần hỗ trợ ngay. */
export const EPDS_SELF_HARM_INDEX = 9;

/** Lọc các dòng hỗ trợ backend còn để số giả (VD: "1900xxxx"). */
export function usableResources(resources?: string[]) {
  return (resources || []).filter((r) => !/x{3,}/i.test(r));
}
