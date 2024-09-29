'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

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
]

export default function MapComponent() {
    const mapRef = useRef(null);
    const driverMarkerRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [map, setMap] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRendererDriver, setDirectionsRendererDriver] = useState(null);
    const [directionsRendererUser, setDirectionsRendererUser] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [driverToUserDistance, setDriverToUserDistance] = useState(null);
    const [driverToUserEta, setDriverToUserEta] = useState(null);
    const [userToDestinationDistance, setUserToDestinationDistance] = useState(null);
    const [userToDestinationEta, setUserToDestinationEta] = useState(null);
    const [destination, setDestination] = useState('');

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
            initMap(database);
        }
    }, [mapLoaded]);

    useEffect(() => {
        if (userLocation && driverLocation && directionsService && directionsRendererDriver) {
            calculateAndDisplayDriverToUserRoute();
        }
    }, [userLocation, driverLocation, directionsService, directionsRendererDriver]);

    useEffect(() => {
        if (userLocation && destination && directionsService && directionsRendererUser) {
            calculateAndDisplayUserToDestinationRoute();
        }
    }, [userLocation, destination, directionsService, directionsRendererUser]);

    function initMap(database) {
        const newMap = new google.maps.Map(mapRef.current, {
            zoom: 14,
            center: { lat: 42.2808, lng: -83.7430 }, // Ann Arbor
        });

        setMap(newMap);

        const newDirectionsService = new google.maps.DirectionsService();
        const newDirectionsRendererDriver = new google.maps.DirectionsRenderer({
            map: newMap,
            polylineOptions: { strokeColor: "blue" }
        });
        const newDirectionsRendererUser = new google.maps.DirectionsRenderer({
            map: newMap,
            polylineOptions: { strokeColor: "green" }
        });

        setDirectionsService(newDirectionsService);
        setDirectionsRendererDriver(newDirectionsRendererDriver);
        setDirectionsRendererUser(newDirectionsRendererUser);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(location);
                newMap.setCenter(location);
                new google.maps.Marker({
                    position: location,
                    map: newMap,
                    title: "Your Location",
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                });
            }, () => {
                console.error("Error: The Geolocation service failed.");
            });
        } else {
            console.error("Error: Your browser doesn't support geolocation.");
        }

        simulateDriverMovement(database);
        listenForDriverLocation(database, newMap);
    }

    function listenForDriverLocation(database, map) {
        const driverLocationRef = ref(database, 'locations/driver123');
        onValue(driverLocationRef, (snapshot) => {
            const location = snapshot.val();
            if (location) {
                const driverLoc = {
                    lat: location.latitude,
                    lng: location.longitude
                };
                setDriverLocation(driverLoc);
                updateDriverMarker(map, driverLoc);
            }
        }, (error) => {
            console.error("Error listening for driver location: ", error);
        });
    }

    function updateDriverMarker(map, location) {
        if (driverMarkerRef.current) {
            driverMarkerRef.current.setPosition(location);
        } else {
            driverMarkerRef.current = new google.maps.Marker({
                position: location,
                map: map,
                title: "Driver Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            });
        }
    }

    function updateLocation(database, userId, lat, lng) {
        const locationRef = ref(database, 'locations/' + userId);
        set(locationRef, {
            latitude: lat,
            longitude: lng
        }).catch((error) => {
            console.error("Error updating location: ", error);
        });
    }

    function simulateDriverMovement(database) {
        let simulatedLat = 42.2955;
        let simulatedLng = -83.7200;

        setInterval(() => {
            simulatedLat -= 0.00005;
            simulatedLng += 0.0001;
            updateLocation(database, "driver123", simulatedLat, simulatedLng);
        }, 5000);
    }

    function calculateAndDisplayDriverToUserRoute() {
        if (!userLocation || !driverLocation) return;

        const request = {
            origin: new google.maps.LatLng(driverLocation.lat, driverLocation.lng),
            destination: new google.maps.LatLng(userLocation.lat, userLocation.lng),
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRendererDriver.setDirections(result);
                const route = result.routes[0];
                const leg = route.legs[0];
                setDriverToUserEta(leg.duration.text);
                setDriverToUserDistance(leg.distance.text);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    }

    function calculateAndDisplayUserToDestinationRoute() {
        if (!userLocation || !destination) return;

        const request = {
            origin: new google.maps.LatLng(userLocation.lat, userLocation.lng),
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRendererUser.setDirections(result);
                const route = result.routes[0];
                const leg = route.legs[0];
                setUserToDestinationEta(leg.duration.text);
                setUserToDestinationDistance(leg.distance.text);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    }

    function handleAddressSubmit(e) {
        e.preventDefault();
        if (destination) {
            calculateAndDisplayUserToDestinationRoute();
        }
    }

    return (
        <main className="h-screen w-screen flex flex-col bg-gray-100">
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCoY5Mc8LL_Frtd0oW5wXKj0_sEicPLUN0&libraries=geometry,places`}
                onLoad={() => setMapLoaded(true)}
            />
            <div id="map" ref={mapRef} className="h-3/4 w-full"></div>
            <div id="info" className="bg-white shadow-md rounded-t-lg -mt-4 flex-grow p-4 space-y-4 pt-8">
                <a href='/admin-home' className='text-blue-500'>Return to Home</a>
                <form onSubmit={handleAddressSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter destination address"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
                    >
                        Route
                    </button>
                </form>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-200 p-3 rounded-md text-gray-700">
                        <p className="font-semibold">User Location:</p>
                        <p>{userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Loading...'}</p>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-md text-gray-700">
                        <p className="font-semibold">Driver Location:</p>
                        <p>{driverLocation ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}` : 'Loading...'}</p>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-md text-gray-700">
                        <p className="font-semibold">Driver to User:</p>
                        <p>Distance - {driverToUserDistance || 'Calculating...'}</p>
                        <p>ETA - {driverToUserEta || 'Calculating...'}</p>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-md text-gray-700">
                        <p className="font-semibold">User to Destination:</p>
                        <p>Distance - {userToDestinationDistance || 'Calculating...'}</p>
                        <p>ETA - {userToDestinationEta || 'Calculating...'}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
