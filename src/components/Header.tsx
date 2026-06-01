import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BRAND } from '@/config/brand';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/utils/notificationsStorage';

export function Header() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user?.id) setNotifCount(getUnreadCount(user.id));
  }, [user?.id, location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const roleLinks = isAuthenticated
    ? isAdmin
      ? [{ path: '/admin', label: 'Admin panel' }]
      : isClient
        ? [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/find-talent', label: 'Find Talent' },
            { path: '/post-job', label: 'Post a Job' },
            { path: '/my-jobs', label: 'My Jobs' },
            { path: '/talent-shortlist', label: 'Shortlist' },
            { path: '/favorites', label: 'Favorites' },
          ]
        : [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/find-work', label: 'Find Work' },
            { path: '/saved-jobs', label: 'Saved' },
            { path: '/application-history', label: 'My Applications' },
          ]
    : [
        { path: '/find-talent', label: 'Find Talent' },
        { path: '/find-work', label: 'Find Work' },
        { path: '/how-it-works', label: 'How it Works' },
        { path: '/pricing', label: 'Pricing' },
      ];

  const navLinks = isAuthenticated
    ? [...roleLinks, { path: '/messages', label: 'Messages' }]
    : roleLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4.5 h-4.5 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">{BRAND.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
{isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user?.name}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden />
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden py-1">
                      <div className="px-4 py-3 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                          {user?.role}
                        </span>
                      </div>
                      {isAdmin ? (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>
                          Admin panel
                        </Link>
                      ) : (
                        <>
                          <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                          <Link to="/notifications" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>
                            Notifications {notifCount > 0 && <span className="ml-1 text-xs text-red-500 font-semibold">({notifCount})</span>}
                          </Link>
                          <Link to="/analytics" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Analytics</Link>
                          <Link to="/invoices" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Invoices</Link>
                          <Link to="/wallet" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Balance</Link>
                          <Link to="/messages" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Messages</Link>
                          {!isClient && (
                            <Link to="/profile/edit" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Edit profile</Link>
                          )}
                          {isClient && (
                            <>
                              <Link to="/post-job" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Post a project</Link>
                              <Link to="/company-profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Company profile</Link>
                            </>
                          )}
                          <Link to="/referrals" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Referrals</Link>
                          <Link to="/export" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setUserMenuOpen(false)}>Export data</Link>
                        </>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-medium"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-slate-100 mt-3 pt-3">
                {isAuthenticated ? (
                  <>
                    <p className="px-3 py-1 text-xs text-slate-400 font-medium">{user?.name} · {user?.email}</p>
                    <button
                      type="button"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link to="/login" className="px-4 py-2.5 text-center text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/signup" className="px-4 py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
