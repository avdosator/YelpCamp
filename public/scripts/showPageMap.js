
// we need to save process.env.MAPBOX_TOKEN in a variable on show page, and put that in the script, so we can use it here
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    // somewhere between server and browser were problems, so we had to call replaceAll like this to correct the images.path
    center: campground.geometry.coordinates,
    zoom: 10,
});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup()
        .setHTML(`<p><b>${campground.title}<b/>,<br> ${campground.location}</p>`)
    )
    .addTo(map);
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

//JSON.parse(campground.replaceAll("\\", "\\\\")).geometry.coordinates