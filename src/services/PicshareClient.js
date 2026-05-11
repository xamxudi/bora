import axios from "axios";
import cookie from "../utils/CookieUtils";

const COOKIE_AUTH = process.env.REACT_APP_COOKIE_AUTH || "SendEnv_AuthToken";
export default axios.create({
  baseURL: process.env.REACT_APP_PICSHARE_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${cookie.get(COOKIE_AUTH)}`
  },
});