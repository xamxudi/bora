import React, { useEffect, useMemo, useRef, useState } from "react";
import "./StyleSelect.css";
import LogoStyle from "../../assets/images/style/logo192.png";
const DEFAULT_THUMBNAIL = `${process.env.PUBLIC_URL}/bora-logo-with-text.png`;

export default function StyleSelect({
  items = [],
  value = "",
  onChange,
  placeholder = "Chọn mẫu...",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = useMemo(
    () => items.find((s) => String(s.id) === String(value)),
    [items, value]
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const onPick = (id) => {
    onChange?.(id);
    setOpen(false);
  };

  return (
    <div className="style-select" ref={rootRef}>
      <button
        type="button"
        className={`style-select__control ${open ? "open" : ""}`}
        onClick={() => setOpen((x) => !x)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <img
              className="style-select__thumb"
              src={selected.imageUrl || DEFAULT_THUMBNAIL}
              alt={selected.name || "Style"}
              onError={(e) => (e.currentTarget.src = DEFAULT_THUMBNAIL)}
            />
            <span className="style-select__label">
              {selected.name}
              {selected.category ? ` — ${selected.category}` : ""}
            </span>
          </>
        ) : (
          <span className="style-select__placeholder">{placeholder}</span>
        )}
        <span className="style-select__chev">▾</span>
      </button>

      {open && (
        <div className="style-select__menu" role="listbox">
          <div
            role="option"
            aria-selected={value === ""}
            className={`style-select__option ${value === "" ? "selected" : ""}`}
            tabIndex={0}
            onClick={() => onPick("")}
          >
            <img
              className="style-select__optionThumb"
              src={LogoStyle}
              alt="default"
            />
            <div className="style-select__optionText">Mặc định</div>
          </div>

          {items.map((s) => (
            <div
              key={s.id}
              role="option"
              aria-selected={String(value) === String(s.id)}
              className={`style-select__option ${String(value) === String(s.id) ? "selected" : ""
                }`}
              tabIndex={0}
              onClick={() => onPick(s.id)}
            >
              <img
                className="style-select__optionThumb"
                src={s.imageUrl || DEFAULT_THUMBNAIL}
                alt={s.name || "Style"}
                onError={(e) => (e.currentTarget.src = DEFAULT_THUMBNAIL)}
              />
              <div className="style-select__optionText">
                <div className="style-select__optionTitle">
                  {s.name} {s.category ? `— ${s.category}` : ""}
                </div>
                {s.description && (
                  <div className="style-select__optionDesc">
                    {s.description.length > 60
                      ? s.description.slice(0, 60) + "…"
                      : s.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
