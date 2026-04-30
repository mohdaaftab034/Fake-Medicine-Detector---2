import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, AlertCircle, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../../context/AppContext.jsx';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeAlerts } = useContext(AppContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const publicNavLinks = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.SCANNER, label: 'Scanner' },
    { path: ROUTES.BATCH_VERIFY, label: 'Batch Verify' },
    { path: ROUTES.MEDICINE_INFO, label: 'Medicine Info' },
    { path: ROUTES.NEARBY_CHEMIST, label: 'Find Chemist' },
    { path: ROUTES.ALERTS, label: 'Alerts', badge: activeAlerts.length > 0 ? activeAlerts.length : null },
  ];

  const roleNavLinks = user
    ? {
        public: [...publicNavLinks, { path: '/dashboard/user', label: 'My Dashboard' }],
        chemist: [...publicNavLinks, { path: '/dashboard/chemist', label: 'Shop Dashboard' }],
        admin: [...publicNavLinks, { path: '/dashboard/admin', label: 'Admin Panel' }],
      }[user.role] || publicNavLinks
    : publicNavLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'chemist') return '/dashboard/chemist';
    return '/dashboard/user';
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-color transition-smooth">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary group-hover:shadow-lg group-hover:shadow-primary/50 transition-smooth">
                <Shield size={24} className="text-bg-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MediGuard
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {roleNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors relative group ${
                    isActive(link.path) ? 'text-primary' : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.badge && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-text-primary bg-danger rounded-full animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </span>
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-all theme-toggle"
                whileClick={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.4 }}
                title="Toggle theme"
              >
                {theme.name === 'dark' ? (
                  <Sun size={20} className="text-warning" />
                ) : (
                  <Moon size={20} className="text-primary" />
                )}
              </motion.button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary border border-border-color hover:border-primary transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-text-primary text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border-color rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border-color">
                        <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                      </div>
                      {getDashboardLink() && (
                        <Link
                          to={getDashboardLink()}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:bg-bg-primary hover:text-primary transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors text-left border-t border-border-color"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">
                    Get Started
                  </Link>
                </div>
              )}

              {!user && (
                <Link to={ROUTES.REPORT_FAKE} className="btn-danger text-sm px-4 py-2">
                  Report Fake
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-all theme-toggle"
                whileClick={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.4 }}
              >
                {theme.name === 'dark' ? (
                  <Sun size={20} className="text-warning" />
                ) : (
                  <Moon size={20} className="text-primary" />
                )}
              </motion.button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-smooth"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isOpen && (
            <div className="lg:hidden fixed inset-0 z-[60]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />

              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                className="absolute top-0 right-0 h-full w-[86%] max-w-sm bg-bg-secondary border-l border-border-color p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-lg font-bold text-text-primary">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-bg-primary transition-smooth"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto">
                  {roleNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        isActive(link.path)
                          ? 'bg-primary/20 text-primary'
                          : 'text-text-secondary hover:bg-bg-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-text-primary bg-danger rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border-color space-y-2">
                  {user ? (
                    <>
                      {getDashboardLink() && (
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-3 rounded-lg text-text-secondary hover:bg-bg-primary"
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left rounded-lg text-danger hover:bg-danger/10 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="btn-primary w-full text-center"
                      >
                        Get Started
                      </Link>
                      <Link to={ROUTES.REPORT_FAKE} onClick={() => setIsOpen(false)} className="btn-danger w-full text-center">
                        Report Fake
                      </Link>
                    </>
                  )}
                </div>
              </motion.aside>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
