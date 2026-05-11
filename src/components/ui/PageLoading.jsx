import React from "react";
import Spinner from "./Spinner";

export default function PageLoading({ message = "Đang tải..." }) {
  return (
    <div className="page-loading">
      <Spinner size="small" />
      <span>{message}</span>
    </div>
  );
}
