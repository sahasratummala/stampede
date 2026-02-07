
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { profile } = useUser();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="bg-burnt-orange text-white px-3 py-1 rounded font-bebas text-2xl tracking-wider">MOODY</span>
                <span className="font-bebas text-2xl text-burnt-orange tracking-widest border-l pl-2 border-gray-300">STUDENTS</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`${isActive('/') ? 'text-burnt-orange font-semibold' : 'text-gray-600'} hover:text-burnt-orange transition`}>Events</Link>
              <Link to="/outfit" className={`${isActive('/outfit') ? 'text-burnt-orange font-semibold' : 'text-gray-600'} hover:text-burnt-orange transition`}>Outfit Recommender</Link>
              <Link to="/buddies" className={`${isActive('/buddies') ? 'text-burnt-orange font-semibold' : 'text-gray-600'} hover:text-burnt-orange transition`}>Concert Buddy</Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs text-gray-500">UT Student ID</span>
                <span className="text-sm font-medium">{profile.name.split(' ')[0][0]}. {profile.name.split(' ').slice(1).join(' ')}</span>
              </div>
              <img 
                src={profile.photo} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-burnt-orange p-0.5 object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-bebas text-2xl mb-4 text-burnt-orange">Hook 'em Horns!</p>
          <p className="text-gray-400 text-sm mb-8">Exclusive platform for University of Texas at Austin students. Managed by Longhorn Entertainment Group.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-burnt-orange transition"><i className="fab fa-instagram fa-lg"></i></a>
            <a href="#" className="hover:text-burnt-orange transition"><i className="fab fa-twitter fa-lg"></i></a>
            <a href="#" className="hover:text-burnt-orange transition"><i className="fab fa-tiktok fa-lg"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
