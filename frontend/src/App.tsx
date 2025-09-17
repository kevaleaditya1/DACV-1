import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/Header';
import Home from './pages/Home';
import University from './pages/University';
import Student from './pages/Student';
import Employer from './pages/Employer';
import Verify from './pages/Verify';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/university" element={<University />} />
            <Route path="/student" element={<Student />} />
            <Route path="/employer" element={<Employer />} />
            <Route path="/verify" element={<Verify />} />
          </Routes>
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;