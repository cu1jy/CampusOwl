"use client";
import { useState } from 'react';
import StudentNavbar from '../components/StudentNavbar';

const StarRating = () => {
    const [rating, setRating] = useState(0);

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
                <span
                    key={index}
                    onClick={() => setRating(index + 1)}
                    className={`cursor-pointer text-2xl ${index < rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

const Report = ({ title, date }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
            <h2 className="text-xl font-semibold text-black">{title}</h2>
            <p className="text-sm text-gray-500 mt-2">{date}</p>
        </div>
        <div>
            <StarRating />
            {/* <p className="text-sm text-gray-500">Add feedback</p> */}
        </div>
    </div>
);

const Ride = ({ date }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
            <h2 className="text-xl font-semibold text-black">{date}</h2>
        </div>
        <div>
            <StarRating />
            {/* <p className="text-sm text-gray-500">Add feedback</p> */}
        </div>
    </div>
);

export default function Home() {
    const [reports] = useState([
        {
            title: "Neighbor Noise Complaint",
            date: "September 28th, 2024",
        },
    ]);

    const [rides] = useState([
        {
            date: "September 28th at 1:17 AM",
        },
        {
            date: "September 1st at 12:48 AM",
        },
    ]);

    return (
        <main className="min-h-screen bg-gray-100">
            <StudentNavbar />
            <div className="container mx-auto py-8">
                <h1 className="font-semibold text-black text-3xl mb-10 text-left">
                    My Reports
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                    {reports.map((report, index) => (
                        <Report key={index} {...report} />
                    ))}
                </div>
                <h1 className="font-semibold text-black text-3xl mt-10 mb-10 text-left">
                    My Rides
                </h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {rides.map((ride, index) => (
                        <Ride key={index} {...ride} />
                    ))}
                </div>
            </div>
        </main>
    );
}
