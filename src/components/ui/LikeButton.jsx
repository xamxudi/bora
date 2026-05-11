import React from "react";

export default function LikeButton({ likes, onLike, disabled, ...rest }) {
  return (
    <button onClick={onLike} disabled={disabled} {...rest}>
      ❤️ {likes}
    </button>
  );
}
