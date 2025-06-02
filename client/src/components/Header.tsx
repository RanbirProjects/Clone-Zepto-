import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-bold text-primary">
              Zepto<span className="text-secondary">Clone</span>
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link to="/" className="text-text hover:text-primary">Home</Link>
            <Link to="/products" className="text-text hover:text-primary">Products</Link>
            <Link to="/cart" className="text-text hover:text-primary">Cart</Link>
            <Link to="/login" className="text-text hover:text-primary">Login</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 