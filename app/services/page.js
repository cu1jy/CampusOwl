"use client";
import React from "react";

const Navbar = () => {
    return (
        <nav className="flex items-center justify-center pt-7 sticky">
            <div className="h-12 flex items-center justify-center px-7 border border-gray-200 space-x-10 rounded-full text-black bg-white text-sm font-medium shadow-[0_5px_20px_0_rgba(86,86,86,0.05)]">
                <a href='/home' className="inline">Home</a>
                <a href='/services' className="inline">Services</a>
                <a href='/map' className="inline">Contact</a>
                <a href='/profile' className="inline">Profile</a>
            </div>
        </nav>
    )
}

const ServiceBlock = () => (
    <div className="bg-blue-900 h-32 rounded-lg shadow-md"></div>
);

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4">
                <h1 className="font-semibold pt-10 text-black text-3xl text-center mb-10">
                    Services
                </h1>
                <div className="grid grid-cols-4 gap-4 w-128">
                    {[...Array(12)].map((_, index) => (
                        <ServiceBlock key={index} />
                    ))}
                </div>
            </div>
        </main>
    );
}
