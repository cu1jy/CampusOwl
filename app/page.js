'use client';

import React from 'react';
import { Moon, Sun } from "lucide-react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">CampusOwl</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        <main className="flex flex-col items-center justify-center space-y-8">
          <h2 className="text-3xl font-semibold text-center">Welcome to CampusOwl</h2>
          
          <p className="text-center max-w-md">
            Your trusted companion for campus safety and transportation. Choose your login type to get started.
          </p>
          
          <div className="flex flex-col space-y-4 w-full max-w-xs">
            <a
              href="/student-home"
              className={`py-3 px-6 rounded-full text-center font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Student Login
            </a>
            <a
              href="/admin-home"
              className={`py-3 px-6 rounded-full text-center font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Admin Login
            </a>
          </div>
        </main>

        <footer className="mt-16 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CampusOwl. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}