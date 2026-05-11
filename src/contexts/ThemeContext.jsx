import React, { createContext, useContext, useState, useEffect } from "react";
import Cookie from "../utils/CookieUtils";

const ThemeContext = createContext({
  theme: "",
  toggleTheme: () => {},
  setThemeUI: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(Cookie.get("sd_theme") || "light");

  useEffect(() => {
    // Xóa các class trước đó
    document.body.classList.remove("light-theme", "dark-theme");

    if (theme) {
      document.body.classList.add(`${theme}-theme`);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      Cookie.set("sd_theme", newTheme);
      return newTheme;
    });
  };

  const setThemeUI = (newTheme) => {
    if (newTheme) {
      setTheme(newTheme);
      Cookie.set("sd_theme", newTheme);
    } else {
      setTheme("");
      Cookie.set("sd_theme", "");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeUI }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
