"use client";
import { useState } from 'react';
import StudentNavbar from '../components/StudentNavbar';
import { AlertTriangle, Bell, Shield, FileText, Key, Users, Calendar, Car, Search, Camera, Smartphone, MapPin } from 'lucide-react';

const SecurityArticle = ({ title, description, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <Icon className="mr-2 text-blue-600" size={24} />
      <h2 className="text-xl font-semibold text-black">{title}</h2>
    </div>
    <p className="text-gray-600">{description}</p>
    <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">Read more</a>
  </div>
);

const ServiceBlock = ({ icon: Icon, title }) => (
  <div className="bg-blue-600 h-32 rounded-lg shadow-md flex flex-col items-center justify-center p-4 text-white">
    <Icon size={32} className="mb-2" />
    <span className="text-center text-sm">{title}</span>
  </div>
);

const services = [
  { icon: Shield, title: "Property Protection" },
  { icon: Bell, title: "Report a Crime or Concern" },
  { icon: FileText, title: "Request an Incident Report" },
  { icon: Key, title: "ID Keys and Locks" },
  { icon: Users, title: "Safe Exchange Zone" },
  { icon: AlertTriangle, title: "Fingerprinting" },
  { icon: Calendar, title: "Event Security" },
  { icon: Car, title: "Ride-Along Program" },
  { icon: Search, title: "Lost and Found" },
  { icon: Camera, title: "Security Cameras" },
  { icon: MapPin, title: "Parking and Transportation" },
  { icon: Smartphone, title: "DPSS Mobile App" }
];

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
      <StudentNavbar />
      <div className="container mx-auto py-8">
        <h1 className="font-semibold text-black text-3xl text-center mb-10">
          Articles
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <SecurityArticle key={index} {...article} />
          ))}
        </div>
        <h1 className="font-semibold pt-10 text-black text-3xl text-center mb-10">
          Services
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <ServiceBlock key={index} icon={service.icon} title={service.title} />
          ))}
        </div>
      </div>
    </main>
  );
}
