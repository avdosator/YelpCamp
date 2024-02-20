
// we need to save process.env.MAPBOX_TOKEN in a variable on show page, and put that in the script, so we can use it here
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    // somewhere between server and browser were problems, so we had to call replaceAll like this to correct the images.path
    center: JSON.parse(campground.replaceAll("\\", "\\\\")).geometry.coordinates,
    zoom: 10,
});

 new mapboxgl.Marker()
     .setLngLat(JSON.parse(campground.replaceAll("\\", "\\\\")).geometry.coordinates)
     .addTo(map)