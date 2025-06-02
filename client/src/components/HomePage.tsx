import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    { title: '10-Minute Delivery', description: 'Get your groceries delivered in just 10 minutes', icon: '🚚' },
    { title: 'Fresh Products', description: '100% fresh and quality products', icon: '✨' },
    { title: 'Best Prices', description: 'Competitive prices on all items', icon: '💰' },
    { title: '24/7 Support', description: 'Round the clock customer support', icon: '🛟' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[500px] w-full">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
          alt="Fresh Groceries"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Fresh Groceries Delivered</h1>
            <p className="text-xl mb-8">Get your groceries delivered in just 10 minutes</p>
            <Link to="/products" className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all inline-block">
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 