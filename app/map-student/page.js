"use client";
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

export default function MapComponent() {
    const mapRef = useRef(null);
    const driverMarkerRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [map, setMap] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRendererUser, setDirectionsRendererUser] = useState(null);
    const [directionsRendererDriver, setDirectionsRendererDriver] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [nearestPickup, setNearestPickup] = useState(null);
    const [showCallButton, setShowCallButton] = useState(false);
    const [showDriverInfo, setShowDriverInfo] = useState(false);
    const [driverLocation, setDriverLocation] = useState(null);
    const [driverToPickupDistance, setDriverToPickupDistance] = useState(null);
    const [driverToPickupEta, setDriverToPickupEta] = useState(null);
    const [userToPickupDistance, setUserToPickupDistance] = useState(null);
    const [userToPickupEta, setUserToPickupEta] = useState(null);

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
        if (userLocation && nearestPickup) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userLocation.lat, userLocation.lng),
                new google.maps.LatLng(nearestPickup.lat, nearestPickup.lng)
            );
            setShowCallButton(distance <= 321.869); // 0.2 miles in meters
        }
    }, [userLocation, nearestPickup]);

    function initMap(database) {
        const newMap = new google.maps.Map(mapRef.current, {
            zoom: 14,
            center: { lat: 42.2808, lng: -83.7430 }, // Ann Arbor
        });

        setMap(newMap);

        const newDirectionsService = new google.maps.DirectionsService();
        const newDirectionsRendererUser = new google.maps.DirectionsRenderer({
            map: newMap,
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#4285F4" } // Blue for user route
        });
        const newDirectionsRendererDriver = new google.maps.DirectionsRenderer({
            map: newMap,
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#FBBC04" } // Yellow for driver route
        });

        setDirectionsService(newDirectionsService);
        setDirectionsRendererUser(newDirectionsRendererUser);
        setDirectionsRendererDriver(newDirectionsRendererDriver);

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

        // Add markers for pickup locations
        PICKUP_LOCATIONS.forEach(location => {
            new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: newMap,
                title: location.name,
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            });
        });

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
                if (nearestPickup) {
                    calculateAndDisplayDriverRoute(driverLoc, nearestPickup);
                }
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
                icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            });
        }
    }

    function findNearestPickup() {
        if (!userLocation) return;

        let nearest = null;
        let minDistance = Infinity;

        PICKUP_LOCATIONS.forEach(location => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userLocation.lat, userLocation.lng),
                new google.maps.LatLng(location.lat, location.lng)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = location;
            }
        });

        setNearestPickup(nearest);
        calculateAndDisplayUserRoute(nearest);
    }

    function calculateAndDisplayUserRoute(destination) {
        if (!userLocation || !destination) return;

        const request = {
            origin: new google.maps.LatLng(userLocation.lat, userLocation.lng),
            destination: new google.maps.LatLng(destination.lat, destination.lng),
            travelMode: google.maps.TravelMode.WALKING
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRendererUser.setDirections(result);
                const route = result.routes[0];
                setUserToPickupDistance(route.legs[0].distance.text);
                setUserToPickupEta(route.legs[0].duration.text);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    }

    function calculateAndDisplayDriverRoute(driverLoc, destination) {
        if (!driverLoc || !destination) return;

        const request = {
            origin: new google.maps.LatLng(driverLoc.lat, driverLoc.lng),
            destination: new google.maps.LatLng(destination.lat, destination.lng),
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRendererDriver.setDirections(result);
                const route = result.routes[0];
                setDriverToPickupDistance(route.legs[0].distance.text);
                setDriverToPickupEta(route.legs[0].duration.text);
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
    }

    function handleCallSafeRide() {
        // In a real app, this would initiate a call
        alert("Call 734-647-8000 for Safe Ride");
    }

    function handleCalledSafeRide() {
        setShowDriverInfo(true);
        // Here you would typically initiate the driver's journey
        simulateDriverMovement();
    }

    function simulateDriverMovement() {
        let simulatedLat = 42.2955;
        let simulatedLng = -83.7200;

        const interval = setInterval(() => {
            simulatedLat -= 0.0001;
            simulatedLng += 0.0002;
            updateDriverLocation(simulatedLat, simulatedLng);

            // Stop simulation when driver is close to pickup location
            if (nearestPickup &&
                Math.abs(simulatedLat - nearestPickup.lat) < 0.001 &&
                Math.abs(simulatedLng - nearestPickup.lng) < 0.001) {
                clearInterval(interval);
            }
        }, 2000);
    }

    function updateDriverLocation(lat, lng) {
        setDriverLocation({ lat, lng });
        if (nearestPickup) {
            calculateAndDisplayDriverRoute({ lat, lng }, nearestPickup);
        }
    }

    return (
        <main className="h-screen flex flex-col bg-gray-100">
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCoY5Mc8LL_Frtd0oW5wXKj0_sEicPLUN0&libraries=geometry,places`}
                onLoad={() => setMapLoaded(true)}
            />
            <div id="map" ref={mapRef} className="h-3/4 w-full"></div>
            <div id="info" className="bg-white shadow-md rounded-t-lg -mt-4 flex-grow p-4 space-y-4 pt-8">
                <a href='/student-home' className='text-blue-500'>Return to Home</a>

                {!showDriverInfo && (
                    <button
                        onClick={findNearestPickup}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
                    >
                        Find Nearest Pickup Location
                    </button>
                )}

                {nearestPickup && !showDriverInfo && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md text-gray-600">
                        <p className="font-semibold">Nearest Pickup Location:</p>
                        <p>{nearestPickup.name}</p>
                        <p>Distance: {userToPickupDistance}</p>
                        <p>ETA (Walking): {userToPickupEta}</p>
                    </div>
                )}

                {showCallButton && !showDriverInfo && (
                    <div className="mt-4">
                        <p className="mb-2 text-green-600 font-semibold">You're near the pickup location!</p>
                        <button
                            onClick={handleCallSafeRide}
                            className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
                        >
                            Call Safe Ride
                        </button>
                        <button
                            onClick={handleCalledSafeRide}
                            className="w-full mt-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300 ease-in-out"
                        >
                            I've Called
                        </button>
                    </div>
                )}

                {showDriverInfo && (
                    <div className="mt-4 p-4 bg-gray-200 rounded-md text-gray-500">
                        <h2 className="font-bold text-lg mb-2">Driver Information:</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="font-semibold">Distance to Pickup:</p>
                                <p>{driverToPickupDistance || 'Calculating...'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">ETA to Pickup:</p>
                                <p>{driverToPickupEta || 'Calculating...'}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="font-semibold">Your Pickup Location:</p>
                            <p>{nearestPickup ? nearestPickup.name : 'Not set'}</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
