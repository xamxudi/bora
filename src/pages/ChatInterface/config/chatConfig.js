export const CHAT_CONFIG = {
  MAX_SESSIONS_PER_MODEL: 15,
  AUTO_SCROLL_BEHAVIOR: 'smooth',
  MESSAGE_TIMESTAMP_FORMAT: { hour: '2-digit', minute: '2-digit' },
  ERROR_MESSAGES: {
    CONNECTION_FAILED: 'Không kết nối được đến máy chủ.',
    SESSION_LIMIT: 'Mỗi model chỉ được tạo tối đa {limit} đoạn chat ({model}).',
    SESSION_LOAD_FAILED: 'Không thể tải lại đoạn chat.',
    SESSION_DELETE_FAILED: 'Không xóa được đoạn chat',
    SESSION_CREATE_FAILED: 'Không tạo được session mới',
    CONVERSATION_CREATE_FAILED: 'Không tạo được cuộc trò chuyện'
  },
  DEFAULT_MESSAGES: {
    NEW_CONVERSATION: 'Đây là đoạn hội thoại mới. Hãy hỏi tôi điều gì đó!',
    CHAT_DISCLAIMER: 'ChatAI có thể mắc sai lầm. Hãy cân nhắc kiểm tra thông tin quan trọng.'
  }
};