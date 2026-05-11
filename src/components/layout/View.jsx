import React, { useState } from "react";
import Header from "./Header";
import Content from "./Content";
import "./View.css";
export default function View({ children, user, setUser, noWrapper = false }) {
  const [isMobileMenuCollapsed, setIsMobileMenuCollapsed] = useState(true);

  return (
    <div className="layout-container">
      <Header
        user={user}
        setUser={setUser}
      />
      {!isMobileMenuCollapsed && (
        <div className="menu-overlay" onClick={() => setIsMobileMenuCollapsed(true)} />
      )}
      <div className="main-body">
        {noWrapper ? (
          children ?? <Content />
        ) : (
          <div className="main-wrapper">
            {children ?? <Content />}
          </div>
        )}
      </div>
    </div>
  );
}