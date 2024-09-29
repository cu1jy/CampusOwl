'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

export default function LocationTrackerPage() {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
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
            initMap(database);
        }
    }, [mapLoaded]);

    function initMap(database) {
        const map = new google.maps.Map(mapRef.current, {
            zoom: 14,
            center: { lat: 42.2808, lng: -83.7430 }, // Ann Arbor
        });

        let userMarker, driverMarker;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(location);
                map.setCenter(location);
                updateUserMarker(map, location);
            }, () => {
                console.error("Error: The Geolocation service failed.");
            });
        } else {
            console.error("Error: Your browser doesn't support geolocation.");
        }

        simulateDriverMovement(database);
        listenForDriverLocation(database, map);

        function updateUserMarker(map, location) {
            if (userMarker) {
                userMarker.setPosition(location);
            } else {
                userMarker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: "Your Location",
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                });
            }
        }

        function updateDriverMarker(map, location) {
            if (driverMarker) {
                driverMarker.setPosition(location);
            } else {
                driverMarker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: "Driver Location",
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                });
            }
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
                    updateDistanceInfo(driverLoc);
                }
            }, (error) => {
                console.error("Error listening for driver location: ", error);
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
        let simulatedLat = 42.2808; // Starting latitude
        let simulatedLng = -83.7430; // Starting longitude

        setInterval(() => {
            simulatedLat += (Math.random() - 0.5) * 0.001;
            simulatedLng += (Math.random() - 0.5) * 0.001;
            updateLocation(database, "driver123", simulatedLat, simulatedLng);
        }, 5000); // Update every 5 seconds
    }

    function updateDistanceInfo(driverLoc) {
        if (userLocation && driverLoc) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userLocation.lat, userLocation.lng),
                new google.maps.LatLng(driverLoc.lat, driverLoc.lng)
            );
            setDistance((distance / 1000).toFixed(2));
        }
    }

    return (
        <main>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCoY5Mc8LL_Frtd0oW5wXKj0_sEicPLUN0&libraries=geometry`}
                onLoad={() => setMapLoaded(true)}
            />
            <div id="map" ref={mapRef} style={{ height: '600px', width: '100%' }}></div>
            <div id="info" style={{ marginTop: '10px' }}>
                <p>User Location: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Loading...'}</p>
                <p>Driver Location: {driverLocation ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}` : 'Loading...'}</p>
                <p>Distance between user and driver: {distance ? `${distance} km` : 'Calculating...'}</p>
            </div>
        </main>
    );
}