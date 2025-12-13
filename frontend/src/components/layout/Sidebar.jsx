// frontend/src/components/layout/Sidebar.jsx
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-600' 
  },
  { 
    name: 'Goals', 
    href: '/projects', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-600' 
  },
  { 
    name: 'AI Planner', 
    href: '/ai-planner', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600' 
  },
  { 
    name: 'Calendar', 
    href: '/calendar', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-red-600' 
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: 'from-cyan-500 to-blue-600' 
  },
];

export const Sidebar = ({ isMobile = false, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`group/sidebar ${isMobile ? 'w-72' : 'w-16 hover:w-72'} h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-xl overflow-hidden transition-all duration-300 ease-in-out`}>
      {/* Logo Section */}
      <div className="p-4 flex items-center border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className={`ml-3 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'} transition-opacity duration-300`}>
          <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">FocusFlow</h1>
          <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Goal Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-2">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={`group/item relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                  isActive
                    ? ''
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                    : 'bg-gray-100 group-hover/item:bg-gray-200'
                }`}>
                  <div className={`${
                    isActive ? 'text-white' : 'text-gray-600 group-hover/item:text-gray-700'
                  }`}>
                    {item.icon}
                  </div>
                </div>
                <span className={`ml-4 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'} transition-opacity duration-300 whitespace-nowrap font-semibold ${
                  isActive ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className={`absolute right-3 w-2 h-2 bg-blue-500 rounded-full ${isMobile ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'} transition-opacity duration-300`}></div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 w-full p-3 border-t border-gray-200">
        <Link
          to="/profile"
          className="flex items-center hover:bg-gray-50 p-2 rounded-xl transition-all duration-200 hover:shadow-md mb-2"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-sm leading-none">
              {(user?.name?.charAt(0) || 'U').toUpperCase()}
            </span>
          </div>
          <div className={`ml-3 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'} transition-opacity duration-300`}>
            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 whitespace-nowrap">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center hover:bg-gray-50 p-2 rounded-xl transition-all duration-200 hover:shadow-md"
        >
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className={`ml-3 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'} transition-opacity duration-300 whitespace-nowrap text-sm font-semibold text-gray-700`}>Sign Out</span>
        </button>
      </div>
      </aside>
  );
};