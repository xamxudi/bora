import React, { createContext, useContext, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  // Hiển thị toast thường + desktop notify nếu được cấp quyền
  const showMessage = (type, message) => {
    toast[type](message);

    // 🔔 Notification desktop
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(getTitle(type), {
        body: message,
        icon: '/bora-logo-with-text.png',
      });
    }
  };

  // Tự cấp quyền 1 lần khi load app
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Tiêu đề theo loại
  const getTitle = (type) => {
    switch (type) {
      case 'success': return '✅ Thành công';
      case 'error': return '❌ Lỗi';
      case 'info': return 'ℹ️ Thông báo';
      case 'warning': return '⚠️ Cảnh báo';
      default: return 'Thông báo';
    }
  };

  // ✅ Tích hợp promise toast
  const showPromise = (promise, options) => {
    return toast.promise(promise, {
      pending: options.pending || 'Đang xử lý...',
      success: options.success || 'Thành công!',
      error: options.error || 'Có lỗi xảy ra.',
    });
  };

  // Cung cấp hàm ra ngoài
  const value = {
    success: (msg) => showMessage('success', msg),
    error: (msg) => showMessage('error', msg),
    info: (msg) => showMessage('info', msg),
    warning: (msg) => showMessage('warning', msg),
    promise: showPromise, // ✅ thêm promise support
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
    </MessageContext.Provider>
  );
};
