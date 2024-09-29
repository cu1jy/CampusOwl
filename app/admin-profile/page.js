"use client";
import { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { Clock, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

// Reusable component for displaying drive requests
const DriveRequestItem = ({ id, requestTime, status, destination, onComplete, onCancel }) => (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <Clock className="mr-2 text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-black">Drive Request #{id}</h2>
            </div>
            <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-sm ${status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                    {status}
                </span>
            </div>
        </div>
        <p className="text-gray-600 mb-2">Requested: {requestTime}</p>
        <p className="text-gray-600 mb-4">Destination: {destination}</p>
        {status === 'Pending' && (
            <div className="flex justify-end space-x-2">
                <button onClick={onComplete} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Complete
                </button>
                <button onClick={onCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Cancel
                </button>
            </div>
        )}
    </div>
);

export default function AdminDriveManagement() {
    // State for Pending and Completed Drives

    const [completedDrives, setCompletedDrives] = useState([
        { id: 4, requestTime: '2024-09-28 11:00 PM', status: 'Completed', destination: 'South Quad' },
        { id: 5, requestTime: '2024-09-28 02:30 AM', status: 'Completed', destination: 'Bursley' },
    ]);

    return (
        <main className="min-h-screen bg-gray-100">
            <AdminNavbar />
            <div className="container mx-auto py-8">

                {/* Completed Drives Section */}
                <h2 className="text-3xl font-semibold mb-g text-black">Completed Drive Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedDrives.map((drive) => (
                        <DriveRequestItem key={drive.id} {...drive} />
                    ))}
                </div>
            </div>
        </main>
    );
}