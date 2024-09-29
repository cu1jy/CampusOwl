"use client";
import { useState } from 'react';
import { AlertTriangle, Bell, Shield } from 'lucide-react';

const Navbar = () => (
  <nav className="bg-blue-600 p-4 text-white">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">CampusOwl</h1>
      <div className="space-x-4">
        <a href="#" className="hover:text-blue-200">Home</a>
        <a href="#" className="hover:text-blue-200">About</a>
        <a href="#" className="hover:text-blue-200">Contact</a>
      </div>
    </div>
  </nav>
);

const SecurityArticle = ({ title, description, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <Icon className="mr-2 text-blue-600" size={24} />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <p className="text-gray-600">{description}</p>
    <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">Read more</a>
  </div>
);

export default function Home() {
  const [articles] = useState([
    {
      title: "New Security Measures Implemented",
      description: "The university has introduced advanced surveillance systems to enhance campus safety.",
      icon: Shield
    },
    {
      title: "Emergency Response Training",
      description: "Students and staff are encouraged to participate in the upcoming emergency response workshops.",
      icon: AlertTriangle
    },
    {
      title: "Campus Alert System Update",
      description: "Our mobile alert system has been upgraded to provide faster notifications during emergencies.",
      icon: Bell
    }
  ]);

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="font-semibold text-black text-3xl text-center mb-10">
          Campus Security Updates
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <SecurityArticle key={index} {...article} />
          ))}
        </div>
      </div>
    </main>
  );
}