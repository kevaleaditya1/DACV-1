import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

const Header: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet, chainId, switchToHolesky } = useWeb3();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const HOLESKY_CHAIN_ID = 17000;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isWrongNetwork = chainId && chainId !== HOLESKY_CHAIN_ID;

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/university', label: 'University', icon: '🎓' },
    { path: '/student', label: 'Student', icon: '👨‍🎓' },
    { path: '/employer', label: 'Employer', icon: '🏢' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DACV</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    location.pathname === item.path
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                }`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                }`}></span>
              </div>
            </button>

            {/* Desktop Wallet Connection */}
            <div className="hidden md:flex items-center space-x-4">
              {isWrongNetwork && (
                <button
                  onClick={switchToHolesky}
                  className="btn bg-warning-500 text-white hover:bg-warning-600 text-sm"
                >
                  Switch to Holesky
                </button>
              )}
              
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {formatAddress(account!)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="btn-secondary text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="btn-primary"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-16 left-0 right-0 bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="p-4 space-y-4">
          {/* Mobile Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Wallet Section */}
          <div className="border-t pt-4 space-y-3">
            {isWrongNetwork && (
              <button
                onClick={() => {
                  switchToHolesky();
                  closeMobileMenu();
                }}
                className="w-full btn bg-warning-500 text-white hover:bg-warning-600 text-sm"
              >
                ⚠️ Switch to Holesky Network
              </button>
            )}
            
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      Connected
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 font-mono">
                    {formatAddress(account!)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    disconnectWallet();
                    closeMobileMenu();
                  }}
                  className="w-full btn-secondary"
                >
                  🔌 Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  closeMobileMenu();
                }}
                className="w-full btn-primary"
              >
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;