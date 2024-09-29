"use client";
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { Clock } from 'lucide-react';

const PICKUP_LOCATIONS = [
    { name: "Central Campus Transit Center", lat: 42.2778, lng: -83.7382 },
    { name: "North Campus", lat: 42.2936, lng: -83.7167 },
    { name: "South Quad", lat: 42.2746, lng: -83.7408 },
    { name: "Michigan Union", lat: 42.2748, lng: -83.7422 },
    { name: "Bursley Hall", lat: 42.2925, lng: -83.7193 }
];

const DRIVER_LOCATIONS = [
    { name: "Driver 1", lat: 42.2783, lng: -83.7375 },
    { name: "Driver 2", lat: 42.2941, lng: -83.7153 },
    { name: "Driver 3", lat: 42.2750, lng: -83.7413 },
    { name: "Driver 4", lat: 42.2743, lng: -83.7430 }
];

const DriveRequestItem = ({ id, requestTime, status, destination, onComplete, onCancel, onMatch }) => (
    <div className="bg-white p-6 rounded-lg shadow-md relative mb-4">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <Clock className="mr-2 text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-black">Drive Request {id}</h2>
            </div>
            <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-sm ${status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                    {status}
                </span>
            </div>
        </div>
        <p className="text-gray-600 mb-2">Requested: {requestTime}</p>
        <p className="text-gray-600 mb-4">Destination: {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}</p>
        {status === 'Pending' && (
            <div className="flex justify-end space-x-2">
                <button onClick={onMatch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Match
                </button>
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

export default function AdminMapComponent() {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [map, setMap] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [driveRequests, setDriveRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [matchedDriver, setMatchedDriver] = useState(null);
    const [eta, setEta] = useState(null);
    const [distance, setDistance] = useState(null);

    const firebaseConfig = {
        apiKey: "AIzaSyCTQdkPz9GWnWiwSUv_yyxC8P1IPr1qW1M",
        authDomain: "campusowl-71f53.firebaseapp.com",
        databaseURL: "https://campusowl-71f53-default-rtdb.firebaseio.com",
        projectId: "campusowl-71f53",
        storageBucket: "campusowl-71f53.appspot.com",
        messagingSenderId: "1023330583662",
        appId: "1:1023330583662:web:48a701e4974829c378127f",
        measurementId: "G-P4NGYXMZ3Q"
    };

    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        if (typeof window !== 'undefined' && mapLoaded) {
            initMap();
        }

        const pendingRequestsRef = ref(database, 'pending');
        onValue(pendingRequestsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sortedRequests = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                        destination: value.destination,
                        requestTime: value.requestTime,
                        status: "Pending"
                    }))
                    .sort((a, b) => new Date(a.requestTime) - new Date(b.requestTime));
                setDriveRequests(sortedRequests);
            } else {
                setDriveRequests([]);
            }
        });
    }, [mapLoaded]);

    function initMap() {
        const newMap = new google.maps.Map(mapRef.current, {
            zoom: 14,
            center: { lat: 42.2808, lng: -83.7430 }, // Ann Arbor
        });

        setMap(newMap);

        const newDirectionsService = new google.maps.DirectionsService();
        const newDirectionsRenderer = new google.maps.DirectionsRenderer({
            map: newMap,
            suppressMarkers: true
        });

        setDirectionsService(newDirectionsService);
        setDirectionsRenderer(newDirectionsRenderer);

        // Add markers for pickup locations
        PICKUP_LOCATIONS.forEach(location => {
            new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: newMap,
                title: location.name,
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            });
        });

        // Add markers for drivers
        DRIVER_LOCATIONS.forEach(location => {
            new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: newMap,
                title: location.name,
                icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            });
        });

        driveRequests.forEach(request => {
            new google.maps.Marker({
                position: { lat: request.destination.lat, lng: request.destination.lng },
                map: newMap,
                title: `Drive Request`,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" // Red dot for requests
            });
        })
    }

    function handleMatch(request) {
        setSelectedRequest(request);
        const closestDriver = findClosestDriver(request.destination);
        setMatchedDriver(closestDriver);
        calculateRoute(closestDriver, request.destination);
    }

    function findClosestDriver(destination) {
        let closestDriver = null;
        let minDistance = Infinity;

        DRIVER_LOCATIONS.forEach(driver => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(driver.lat, driver.lng),
                new google.maps.LatLng(destination.lat, destination.lng)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestDriver = driver;
            }
        });

        return closestDriver;
    }

    function calculateRoute(driver, destination) {
        if (!driver || !destination) return;

        const request = {
            origin: new google.maps.LatLng(driver.lat, driver.lng),
            destination: new google.maps.LatLng(destination.lat, destination.lng),
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
                const route = result.routes[0];
                setEta(route.legs[0].duration.text);
                setDistance(route.legs[0].distance.text);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    }

    function handleComplete(id) {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        const requestRef = ref(database, `pending/${id}`);

        update(requestRef, { status: 'Completed' })
            .then(() => {
                console.log('Request marked as completed');
                setSelectedRequest(null);
                setMatchedDriver(null);
                setEta(null);
                setDistance(null);
                if (directionsRenderer) {
                    directionsRenderer.setDirections({ routes: [] });
                }
            })
            .catch((error) => {
                console.error('Error updating request:', error);
            });

        remove(requestRef)
            .then(() => {
                console.log('Request completed and removed');
                setSelectedRequest(null);
                setMatchedDriver(null);
                setEta(null);
                setDistance(null);
                if (directionsRenderer) {
                    directionsRenderer.setDirections({ routes: [] });
                }
            })
            .catch((error) => {
                console.error('Error completing request:', error);
            });
    }

    function handleCancel(id) {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        const requestRef = ref(database, `pending/${id}`);

        remove(requestRef)
            .then(() => {
                console.log('Request cancelled and removed');
                setSelectedRequest(null);
                setMatchedDriver(null);
                setEta(null);
                setDistance(null);
                if (directionsRenderer) {
                    directionsRenderer.setDirections({ routes: [] });
                }
            })
            .catch((error) => {
                console.error('Error cancelling request:', error);
            });
    }

    return (
        <main className="h-screen w-screen flex bg-gray-100">
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCoY5Mc8LL_Frtd0oW5wXKj0_sEicPLUN0&libraries=geometry,places`}
                onLoad={() => setMapLoaded(true)}
            />
            <div className="w-1/3 bg-white p-4 overflow-y-auto">
                <a href='/admin-home' className='text-blue-500'>Return to Home</a>
                <h1 className="text-2xl font-bold mb-4 text-black">Incoming Drive Requests</h1>
                {driveRequests.map(request => (
                    <DriveRequestItem
                        key={request.id}
                        {...request}
                        onMatch={() => handleMatch(request)}
                        onComplete={() => handleComplete(request.id)}
                        onCancel={() => handleCancel(request.id)}
                    />
                ))}
            </div>
            <div className="w-2/3 flex flex-col">
                <div id="map" ref={mapRef} className="h-full w-full"></div>
                {selectedRequest && matchedDriver && (
                    <div id="info" className="bg-white shadow-md p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-200 p-3 rounded-md text-gray-700">
                                <p className="font-semibold">Selected Request:</p>
                                <p>ID: {selectedRequest.id}</p>
                                <p>Destination: {selectedRequest.destination.lat.toFixed(4)}, {selectedRequest.destination.lng.toFixed(4)}</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md text-gray-700">
                                <p className="font-semibold">Matched Driver:</p>
                                <p>Name: {matchedDriver.name}</p>
                                <p>Location: {matchedDriver.lat.toFixed(4)}, {matchedDriver.lng.toFixed(4)}</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md text-gray-700">
                                <p className="font-semibold">Route Information:</p>
                                <p>ETA: {eta || 'Calculating...'}</p>
                                <p>Distance: {distance || 'Calculating...'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
