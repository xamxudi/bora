import React from "react";
import Spinner from "./Spinner";

export default function GlobalLoading({ message = "Đang tải ứng dụng..." }) {
  return (
    <div className="loading-overlay">
      <Spinner size="large" />
      <p>{message}</p>
    </div>
  );
}
