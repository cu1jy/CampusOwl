"use client";
import { useEffect } from 'react';

export default function Map() {
    useEffect(() => {
        let map, directionsService, directionsRenderer, userLocation;

        function initMap() {
            const options = {
                zoom: 17,
                center: { lat: 42.2808, lng: -83.7430 } // Default center (Ann Arbor, MI)
            };

            map = new google.maps.Map(document.getElementById('map'), options);

            // Directions service and renderer
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    map.setCenter(userLocation);

                    new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: "Your Location"
                    });
                }, () => handleLocationError(true, map.getCenter()));
            } else {
                handleLocationError(false, map.getCenter());
            }
        }

        function handleLocationError(browserHasGeolocation, pos) {
            console.error(browserHasGeolocation ?
                "Error: The Geolocation service failed." :
                "Error: Your browser doesn't support geolocation."
            );
        }

        function calculateRoute() {
            const destinationAddress = document.getElementById('destination-input').value;
            if (!destinationAddress) {
                alert("Please enter a destination address.");
                return;
            }

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: destinationAddress }, function (results, status) {
                if (status === 'OK') {
                    const destinationLocation = results[0].geometry.location;

                    const request = {
                        origin: userLocation,
                        destination: destinationLocation,
                        travelMode: 'WALKING'
                    };

                    directionsService.route(request, function (result, status) {
                        if (status == 'OK') {
                            directionsRenderer.setDirections(result);

                            const duration = result.routes[0].legs[0].duration.text;
                            document.getElementById('eta').innerHTML = `Estimated travel time: ${duration}`;
                        } else {
                            console.error('Directions request failed due to ' + status);
                        }
                    });
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }

        window.calculateRoute = calculateRoute;
        window.initMap = initMap;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCoY5Mc8LL_Frtd0oW5wXKj0_sEicPLUN0&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

    }, []);

    return (
        <main className='bg-white text-black'>
            <div id="controls" className='flex align-center h-10'>
                <a href="/student-home" className="text-black pr-5">
                    <p>&lt;</p>
                </a>
                <input id="destination-input" type="text" placeholder="Enter destination address" />
                <button onClick={() => window.calculateRoute()}>Get Directions</button>
            </div>
            <div id="map" style={{ height: '700px', width: '100%' }}></div>
            <div id="eta" style={{ fontWeight: 'bold', marginTop: '10px' }}></div>
        </main>
    );
}
