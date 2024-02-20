// we need to save process.env.MAPBOX_TOKEN in a variable on show page, and put that in the script, so we can use it here
mapboxgl.accessToken = mapToken;
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 6, // starting zoom
        });