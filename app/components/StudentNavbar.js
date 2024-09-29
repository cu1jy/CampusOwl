"use client";
import React, { useState, useEffect } from "react";

const StudentNavbar = () => {
    return (
        <nav className="bg-blue-600 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <a href="/student-home" className="text-2xl font-bold">CampusOwl</a>
                <div className="space-x-4">
                    <a href="/map-student" className="hover:text-blue-200">Ride</a>
                    <a href="/student-profile" className="hover:text-blue-200">Profile</a>
                    <a href="/" className="hover:text-blue-200">Logout</a>
                </div>
            </div>
        </nav>
    )
}

export default StudentNavbar
