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
    const [pendingDrives, setPendingDrives] = useState([
        { id: 1, requestTime: '2024-09-29 10:30 AM', status: 'Pending', destination: 'Downtown Library' },
        { id: 2, requestTime: '2024-09-29 11:45 AM', status: 'Pending', destination: 'Science Building' },
        { id: 3, requestTime: '2024-09-29 02:15 PM', status: 'Pending', destination: 'Student Center' },
    ]);

    const [completedDrives, setCompletedDrives] = useState([
        { id: 4, requestTime: '2024-09-28 09:00 AM', status: 'Completed', destination: 'Athletic Complex' },
        { id: 5, requestTime: '2024-09-28 03:30 PM', status: 'Completed', destination: 'Main Hall' },
    ]);

    // Function to handle completing a drive
    const handleCompleteDrive = (id) => {
        const driveToComplete = pendingDrives.find(drive => drive.id === id);
        if (driveToComplete) {
            setPendingDrives(pendingDrives.filter(drive => drive.id !== id));
            setCompletedDrives([...completedDrives, { ...driveToComplete, status: 'Completed' }]);
        }
    };

    // Function to handle cancelling a drive
    const handleCancelDrive = (id) => {
        setPendingDrives(pendingDrives.filter(drive => drive.id !== id));
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <AdminNavbar />
            <div className="container mx-auto py-8">
                {/* Pending Drives Section */}
                <h1 className="text-3xl font-semibold mb-6 text-black">Pending Drive Requests</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {pendingDrives.map((drive) => (
                        <DriveRequestItem
                            key={drive.id}
                            {...drive}
                            onComplete={() => handleCompleteDrive(drive.id)}
                            onCancel={() => handleCancelDrive(drive.id)}
                        />
                    ))}
                </div>

                {/* Completed Drives Section */}
                <h2 className="text-2xl font-semibold mb-4 text-black">Completed Drive Requests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedDrives.map((drive) => (
                        <DriveRequestItem key={drive.id} {...drive} />
                    ))}
                </div>
            </div>
        </main>
    );
}