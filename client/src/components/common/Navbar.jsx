import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Bell, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getMyNotifications, markNotificationRead, markAllNotificationsRead,
} from '../../services/api';
import { timeAgo } from '../../utils/timeAgo';
import Button, { getButtonClasses } from '../ui/Button';

function NotificationBell({ notifications, unreadCount, isOpen, onToggle, onMarkRead, onMarkAllRead }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-label="Notifications"
        className="relative text-text-muted hover:text-cyan transition-colors p-1"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-status-open text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 max-w-[90vw] max-h-96 overflow-y-auto bg-white border border-hairline rounded-xl shadow-xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-hairline sticky top-0 bg-white">
              <span className="font-heading text-sm font-bold text-ink">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-cyan font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-center text-xs text-ink/50 py-8">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => onMarkRead(n._id)}
                  className={`w-full text-left px-4 py-3 border-b border-hairline last:border-0 hover:bg-light transition-colors ${
                    !n.isRead ? 'bg-cyan-dim/30' : ''
                  }`}
                >
                  <p className="text-sm text-ink">{n.message}</p>
                  <p className="text-xs text-ink/40 mt-1">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileMenu({ user, isOpen, onToggle, onLogout }) {
  const initial = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-label="Account menu"
        className="w-9 h-9 rounded-full overflow-hidden border border-cyan-dim bg-cyan-dim text-cyan font-bold text-sm flex items-center justify-center shrink-0 hover:border-cyan transition-colors"
      >
        {user.profilePhoto ? (
          <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-64 bg-white border border-hairline rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="px-4 py-4 border-b border-hairline">
              <p className="font-heading text-sm font-bold text-ink truncate">{user.name}</p>
              <p className="font-body text-xs text-ink/50 mt-0.5 truncate">{user.email}</p>
            </div>

            <Link
              to="/profile"
              onClick={onToggle}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-light transition-colors"
            >
              <UserCog size={16} className="text-cyan" /> My Profile
            </Link>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-status-open hover:bg-light transition-colors text-left"
            >
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyNotifications()
      .then((data) => setNotifications(data))
      .catch((err) => console.error('Failed to load notifications', err));
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', show: true },
    { to: '/map', label: 'Map', show: true },
    { to: '/my-reports', label: 'My Reports', show: !!user },
    { to: '/submit-report', label: 'Report Issue', show: !!user },
    { to: '/admin/dashboard', label: 'Dashboard', show: user?.role === 'admin' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-navy border-b border-cyan-dim px-6 py-4">
      {(notifOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotifOpen(false);
            setProfileOpen(false);
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="font-heading text-xl font-bold text-text-primary"
        >
          Civic <span className="text-cyan">Map</span>
        </Link>

        {/* Desktop nav — hidden below md breakpoint */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks
            .filter((link) => link.show)
            .map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-text-muted hover:text-cyan transition-colors"
              >
                {link.label}
              </Link>
            ))}

          {user ? (
            <>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                isOpen={notifOpen}
                onToggle={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
              />
              <ProfileMenu
                user={user}
                isOpen={profileOpen}
                onToggle={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                onLogout={handleLogout}
              />
            </>
          ) : (
            <>
              <Link to="/signup" className={getButtonClasses({ variant: 'outlineDark', size: 'sm' })}>
                Sign Up
              </Link>
              <Link to="/login" className={getButtonClasses({ variant: 'primary', size: 'sm' })}>
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile — bell + avatar (if logged in) + hamburger, always visible below md */}
        <div className="flex items-center gap-3 md:hidden">
          {user && (
            <>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                isOpen={notifOpen}
                onToggle={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
              />
              <ProfileMenu
                user={user}
                isOpen={profileOpen}
                onToggle={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                onLogout={handleLogout}
              />
            </>
          )}
          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-text-primary p-1"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel — just nav links now, profile/logout live in the avatar menu above */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col items-start gap-4 pt-5">
              {navLinks
                .filter((link) => link.show)
                .map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-body text-text-muted hover:text-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

              {!user && (
                <div className="flex gap-3">
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className={getButtonClasses({ variant: 'outlineDark', size: 'sm' })}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={getButtonClasses({ variant: 'primary', size: 'sm' })}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;