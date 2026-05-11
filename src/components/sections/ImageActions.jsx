import React from "react";
import LikeButton from "../ui/LikeButton";
import SaveButton from "../ui/SaveButton";

export default function ImageActions({ disabled, likes, onLike, onSave, className, ...rest }) {
  return (
    <div className={className} {...rest}>
      <LikeButton
        className="btn-like"
        likes={likes}
        onLike={!disabled ? onLike : undefined}
        {...(disabled ? { disabled: true } : {})}
      />
      <SaveButton onSave={onSave} width={20} height={20} className="btn-save"/>
    </div>
  );
}
