import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

const Home: React.FC = () => {
  const { isConnected } = useWeb3();

  const features = [
    {
      title: 'Tamper-Proof Credentials',
      description: 'Academic credentials stored on blockchain cannot be forged or altered',
      icon: '🔒',
    },
    {
      title: 'Instant Verification',
      description: 'Verify credentials in seconds using blockchain technology',
      icon: '⚡',
    },
    {
      title: 'Global Accessibility',
      description: 'Access and verify credentials from anywhere in the world',
      icon: '🌍',
    },
    {
      title: 'Privacy Protected',
      description: 'Only credential hashes stored on-chain, documents on IPFS',
      icon: '🛡️',
    },
  ];

  const userTypes = [
    {
      title: 'Universities',
      description: 'Issue tamper-proof digital credentials to students',
      link: '/university',
      icon: '🎓',
      color: 'bg-blue-500',
    },
    {
      title: 'Students',
      description: 'View and share your verified academic credentials',
      link: '/student',
      icon: '👨‍🎓',
      color: 'bg-green-500',
    },
    {
      title: 'Employers',
      description: 'Instantly verify candidate credentials',
      link: '/employer',
      icon: '💼',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Decentralized Academic
          <span className="text-primary-600"> Credential Verification</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Secure, transparent, and instant verification of academic credentials using blockchain technology.
          Issue, store, and verify educational certificates with complete trust and transparency.
        </p>
        
        {!isConnected && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 max-w-md mx-auto mb-8">
            <p className="text-warning-800 text-sm">
              👆 Connect your wallet to get started with DACV
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose DACV?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Choose Your Role
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {userTypes.map((userType, index) => (
            <Link
              key={index}
              to={userType.link}
              className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-16 h-16 ${userType.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {userType.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {userType.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {userType.description}
              </p>
              <div className="flex items-center text-primary-600 font-medium">
                Get Started 
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gray-50 -mx-4 px-4 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Issue Credential
            </h3>
            <p className="text-gray-600">
              Universities upload credentials to IPFS and store the hash on blockchain
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Store Securely
            </h3>
            <p className="text-gray-600">
              Credentials are tamper-proof and permanently stored on the blockchain
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verify Instantly
            </h3>
            <p className="text-gray-600">
              Anyone can verify credential authenticity in seconds using the blockchain
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 text-center">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
            <div className="text-gray-600">Tamper-Proof</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">&lt;5s</div>
            <div className="text-gray-600">Verification Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600">Global Access</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;