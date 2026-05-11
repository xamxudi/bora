import React from "react";

export default function BoraCredit({
  value = 0,
  size = "md",        // sm | md | lg
  variant = "soft",   // solid | soft | outline
  icon = "emoji",     // emoji | svg
  className = "",
  style,
  ...rest
}) {
  // format số: 1.2K, 2.5M...
  const formatValue = (v) => {
    const n = Number(v ?? 0);
    if (Number.isNaN(n)) return v;
    if (n >= 10_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
    if (n >= 10_000) return `${(n / 1_000).toFixed(n % 1_000 ? 1 : 0)}K`;
    return `${n}`;
  };

  const EmojiIcon = <span className="bora-creadit__icon" aria-hidden>⚡</span>;

  const SvgIcon = (
    <svg
      className="bora-creadit__icon"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" fill="currentColor" />
    </svg>
  );

  return (
    <span
      className={`bora-creadit bora-creadit--${size} bora-creadit--${variant} ${className}`}
      style={style}
      role="status"
      aria-label={`${value} bora-creadit`}
      {...rest}
    >
      {icon === "svg" ? SvgIcon : EmojiIcon}
      <span className="bora-creadit__value">{formatValue(value)}</span>
    </span>
  );
}
