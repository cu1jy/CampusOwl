"use client";
import React, { useState, useEffect } from "react";

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

export default Navbar
