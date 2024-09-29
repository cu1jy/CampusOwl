"use client";
import React, { useState, useEffect } from "react";

const AdminNavbar = () => {
    return (
        <nav className="bg-blue-600 p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <a href="/admin-home" className="text-2xl font-bold">CampusOwl</a>
                <div className="space-x-4">
                    <a href="/map-admin" className="hover:text-blue-200">Pick Ups</a>
                    <a href="/admin-profile" className="hover:text-blue-200">Requests</a>
                    <a href="/" className="hover:text-blue-200">Logout</a>
                </div>
            </div>
        </nav>
    )
}

export default AdminNavbar
