import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Sun, Moon, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContext.jsx';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeAlerts } = useContext(AppContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const publicNavLinks = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.SCANNER, label: 'Scanner' },
    { path: ROUTES.BATCH_VERIFY, label: 'Batch Verify' },
    { path: ROUTES.MEDICINE_INFO, label: 'Medicine Info' },
    { path: ROUTES.NEARBY_CHEMIST, label: 'Find Chemist' },
    { path: ROUTES.ALERTS, label: 'Alerts', badge: activeAlerts?.length > 0 ? activeAlerts.length : null },
    { path: '/agent', label: '🤖 AI Agent', special: true },
  ];

  const navLinks = user
    ? ({
      public: [...publicNavLinks, { path: '/dashboard/user', label: 'Dashboard' }],
      chemist: [...publicNavLinks, { path: '/dashboard/chemist', label: 'Dashboard' }],
      admin: [...publicNavLinks, { path: '/dashboard/admin', label: 'Admin' }],
    }[user.role] || publicNavLinks)
    : publicNavLinks;

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'chemist') return '/dashboard/chemist';
    return '/dashboard/user';
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`mg-nav${scrolled ? ' mg-nav--scrolled' : ''}`}>
        <div className="mg-nav__inner">

          {/* Logo */}
          <Link to={ROUTES.HOME} className="mg-nav__logo" onClick={() => setMobileOpen(false)}>
            <div className="mg-nav__logo-icon">
              <Shield size={18} strokeWidth={2} />
            </div>
            <span className="mg-nav__logo-text">MediGuard</span>
          </Link>

          {/* Desktop links */}
          <div className="mg-nav__links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mg-nav__link${isActive(link.path) ? ' mg-nav__link--active' : ''}${link.special ? ' mg-nav__link--special' : ''}`}
                style={link.special ? { color: '#00B4D8', fontWeight: '700' } : {}}
              >
                {link.label}
                {link.badge && (
                  <span className="mg-nav__badge">{link.badge}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="mg-nav__right">
            <button
              onClick={toggleTheme}
              className="mg-nav__icon-btn"
              aria-label="Toggle theme"
            >
              {theme?.name === 'dark'
                ? <Sun size={17} strokeWidth={1.75} />
                : <Moon size={17} strokeWidth={1.75} />
              }
            </button>

            {user ? (
              <div className="mg-nav__user-wrap" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="mg-nav__user-btn"
                >
                  <div className="mg-nav__user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="mg-nav__user-name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`mg-nav__chevron${userMenuOpen ? ' mg-nav__chevron--open' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="mg-user-menu"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="mg-user-menu__header">
                        <p className="mg-user-menu__name">{user.name}</p>
                        <p className="mg-user-menu__role">{user.role}</p>
                      </div>
                      {getDashboardLink() && (
                        <Link
                          to={getDashboardLink()}
                          className="mg-user-menu__item"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={15} />
                          Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="mg-user-menu__item mg-user-menu__item--danger">
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mg-nav__auth">
                <Link to="/register" className="mg-btn mg-btn--primary mg-btn--sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="mg-nav__mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mg-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="mg-mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="mg-mobile-drawer__header">
                <Link to={ROUTES.HOME} className="mg-nav__logo" onClick={() => setMobileOpen(false)}>
                  <div className="mg-nav__logo-icon"><Shield size={16} /></div>
                  <span className="mg-nav__logo-text">MediGuard</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="mg-nav__icon-btn">
                  <X size={20} />
                </button>
              </div>

              <nav className="mg-mobile-drawer__nav">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`mg-mobile-link${isActive(link.path) ? ' mg-mobile-link--active' : ''}`}
                  >
                    {link.label}
                    {link.badge && <span className="mg-nav__badge">{link.badge}</span>}
                  </Link>
                ))}
              </nav>

              <div className="mg-mobile-drawer__footer">
                <button onClick={toggleTheme} className="mg-mobile-link" style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'none' }}>
                  {theme?.name === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
                </button>
                {user ? (
                  <>
                    {getDashboardLink() && (
                      <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="mg-mobile-link">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="mg-mobile-link mg-mobile-link--danger" style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'none' }}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="mg-btn mg-btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Get Started
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;