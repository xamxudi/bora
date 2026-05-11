// Utility functions for handling cookies + fallback localStorage
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return localStorage.getItem(name) || null;
};

export const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
  localStorage.setItem(name, value);
};

export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
  localStorage.removeItem(name); // 👈 thêm dòng này
};

// Export tiện lợi
const CookieUtils = {
  get: getCookie,
  set: setCookie,
  remove: removeCookie,
};

export default CookieUtils;
