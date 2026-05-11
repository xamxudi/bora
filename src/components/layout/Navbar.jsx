import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar({ menuItems = [] }) {
    const [openMenu, setOpenMenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const [openSubMenu, setOpenSubMenu] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            if (openMenu?.index !== undefined) {
                const navItem = document.querySelectorAll(".nav-item")[openMenu.index];
                if (navItem) {
                    const rect = navItem.getBoundingClientRect();
                    setOpenMenu((prev) => ({
                        ...prev,
                        offsetLeft: rect.left
                    }));
                }
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [openMenu?.index]);

    // Enhanced mobile menu close function
    const closeMobileMenu = () => {
        setMobileOpen(false);
        setOpenSubMenu(null);
        document.body.style.overflow = 'auto';
    };

    // Enhanced mobile menu open function  
    const openMobileMenu = () => {
        setMobileOpen(true);
        document.body.style.overflow = 'hidden';
    };

    // Handle navigation
    const handleNavigation = (href) => {
        if (href?.startsWith('http')) {
            window.open(href, '_blank', 'noopener,noreferrer');
        } else if (href) {
            navigate(href);
        }
        closeMobileMenu();
    };

    // Handle submenu toggle with enhanced animation
    const toggleSubmenu = (itemIdx) => {
        setOpenSubMenu(openSubMenu === itemIdx ? null : itemIdx);
    };

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && mobileOpen) {
                closeMobileMenu();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [mobileOpen]);

    return (
        <nav className="navbar header-nav">
            {/* Mobile Toggle */}
            <button
                className="mobile-toggle"
                onClick={() => mobileOpen ? closeMobileMenu() : openMobileMenu()}
                aria-label="Toggle mobile menu"
            >
                {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Desktop Menu */}
            <div
                className="nav-wrapper"
                onMouseLeave={() => setOpenMenu(null)}
            >
                <ul className="nav-list desktop-only">
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            className="nav-item"
                            onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setOpenMenu({ index, offsetLeft: rect.left });
                            }}
                        >
                            <span className="nav-title">
                                {item.href ? (
                                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : '_self'}>
                                        {item.title}
                                    </a>
                                ) : item.title}
                                {item.children?.length > 0 && <FaChevronDown className="nav-icon" />}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className={`mega-menu ${openMenu ? "open" : ""}`}>
                    {openMenu && menuItems[openMenu.index]?.children && (
                        <div
                            className="columns-wrapper"
                            style={{ marginLeft: openMenu.offsetLeft }}
                        >
                            {menuItems[openMenu.index].children.map((group, gIdx) => (
                                <div key={gIdx} className="mega-column">
                                    {group.title && (
                                        <strong className="mega-column-title">{group.title}</strong>
                                    )}
                                    {group.links?.map((link, lIdx) => (
                                        <a
                                            key={lIdx}
                                            href={link.href || "#"}
                                            target={link.href?.startsWith('http') ? '_blank' : '_self'}
                                            rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        >
                                            {link.label || link}
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Mobile Menu */}
            {mobileOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="menu-overlay"
                        onClick={closeMobileMenu}
                    ></div>

                    {/* Enhanced Sidebar menu */}
                    <aside className="menu-left-mobile">


                        <div className="menu-items">
                            {menuItems.map((item, itemIdx) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const isOpen = openSubMenu === itemIdx;

                                return (
                                    <div key={itemIdx} className="menu-item">
                                        <div
                                            className="menu-item-title"
                                            onClick={() => {
                                                if (hasChildren) {
                                                    toggleSubmenu(itemIdx);
                                                } else {
                                                    handleNavigation(item.href);
                                                }
                                            }}
                                        >
                                            <div className="menu-title-content">
                                                <div className="menu-icon">
                                                    {item.icon}
                                                </div>
                                                <span className="menu-label">{item.title}</span>
                                            </div>
                                            {hasChildren && (
                                                <FaChevronDown
                                                    className={`chevron ${isOpen ? "open" : ""}`}
                                                    size={12}
                                                />
                                            )}
                                        </div>

                                        {/* Enhanced Submenu */}
                                        {hasChildren && (
                                            <div className={`submenu ${isOpen ? 'active' : ''}`}>
                                                {item.children.map((group, gIdx) => (
                                                    <div key={gIdx} className="submenu-category">
                                                        {group.title && (
                                                            <div className="category-title">{group.title}</div>
                                                        )}
                                                        <div className="submenu-links">
                                                            {group.links?.map((link, lIdx) => (
                                                                <a
                                                                    key={lIdx}
                                                                    className="submenu-link"
                                                                    href={link.href || "#"}
                                                                    target={link.href?.startsWith('http') ? '_blank' : '_self'}
                                                                    rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                                    onClick={() => handleNavigation(link.href)}
                                                                >
                                                                    {link.icon && (
                                                                        <div className={`submenu-icon ${link.gradient || 'gradient-blue'}`}>
                                                                            {link.icon}
                                                                        </div>
                                                                    )}
                                                                    <div className="submenu-content">
                                                                        <div className="submenu-title">{link.label || link}</div>
                                                                        {link.description && (
                                                                            <div className="submenu-description">{link.description}</div>
                                                                        )}
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                </>
            )}
        </nav>
    );
}