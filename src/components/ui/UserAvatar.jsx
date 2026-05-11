import React from "react";

export default function UserAvatar({ name, imgUrl, size = 40, style, className, ...rest}) {
  const firstLetter = name?.[0]?.toUpperCase() || "?";

  return (
    <div
      style={{
        width: size,
        height: size,
        fontSize: size / 2,
        ...style,
      }}
      className={`user-avatar ${className || ""}`}
      {...rest}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        firstLetter
      )}
    </div>
  );
}
