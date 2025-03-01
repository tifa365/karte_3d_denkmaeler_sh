// Based on this sample
// https://basemap.de/data/produkte/web_vektor/anwendungsbeispiele/baudenkmale_brandenburg.html

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json',
    center: [9.4333264, 54.7833021],
    zoom: 15,
    pitch: 60,
    bearing: -17.6,
    canvasContextAttributes: {antialias: true},
});

// Flag to track label visibility state
let labelsVisible = true;

map.on('load', () => {
    // Add the buildings layer
    map.addLayer({
        'id': 'Kulturdenkmale',
        'type': 'fill-extrusion',
        'source': {
            'type': 'geojson',
            'data': 'https://raw.githubusercontent.com/tursics/opendataday2025/refs/heads/main/denkmalliste-flensburg.geojson'
        },
        'paint': {
            'fill-extrusion-color': 'rgba(215, 59, 59, 1)',
            'fill-extrusion-opacity': 0.8,
            'fill-extrusion-height': 20
        }
    });

    // Add single layer with colored labels
    map.addLayer({
        'id': 'building-labels',
        'type': 'symbol',
        'source': {
            'type': 'geojson',
            'data': 'https://raw.githubusercontent.com/tursics/opendataday2025/refs/heads/main/denkmalliste-flensburg.geojson'
        },
        'layout': {
            'text-field': ['get', 'Ansprache'],
            'text-size': 12,
            'text-font': ['Open Sans Bold'],
            'text-anchor': 'center',
            'text-offset': [0, -1.5], // Offset slightly above buildings
            'text-justify': 'center',
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'symbol-sort-key': [
                'match',
                ['get', 'Art'],
                'Kirche', 1,
                'Kulturbauten', 2,
                'Verwaltungsgebäude', 3,
                'Wehrbauten', 4,
                'Geschäftshaus', 5,
                'Justizgebäude', 6,
                10 // Default value for other types
            ]
        },
        'paint': {
            'text-color': '#ffffff',
            'text-opacity': 1,
            // Colored background via text-halo
            'text-halo-color': [
                'match',
                ['get', 'Art'],
                'Wohnbau', 'rgba(65, 105, 225, 0.85)', // Royal blue for residential
                'Kirche', 'rgba(128, 0, 128, 0.85)', // Purple for churches
                'Kulturbauten', 'rgba(255, 140, 0, 0.85)', // Orange for cultural buildings
                'Verwaltungsgebäude', 'rgba(0, 128, 128, 0.85)', // Teal for administration
                'Geschäftshaus', 'rgba(46, 139, 87, 0.85)', // Sea green for business
                'Wehrbauten', 'rgba(139, 0, 0, 0.85)', // Dark red for defensive structures
                'Produktionsstätte', 'rgba(184, 134, 11, 0.85)', // Dark goldenrod for production
                'Justizgebäude', 'rgba(25, 25, 112, 0.85)', // Midnight blue for justice buildings
                'Gartenelemente', 'rgba(60, 179, 113, 0.85)', // Medium sea green for garden elements
                'Versorgungsbau', 'rgba(70, 130, 180, 0.85)', // Steel blue for supply buildings
                'rgba(33, 33, 33, 0.8)' // Default semi-transparent dark gray
            ],
            'text-halo-width': 2.5,
            'text-halo-blur': 0
        }
    });

    // Add clickable building functionality
    map.on('click', 'Kulturdenkmale', (e) => {
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            
            // You could add more functionality here like opening a sidebar with details
            console.log('Building clicked:', props.Ansprache, props.Strasse, props.Hausnummer);
        }
    });
    
    // Set up the toggle labels checkbox with fancy switch
    const toggleLabelsCheckbox = document.getElementById('toggle-labels');
    
    // Set initial state based on checkbox (which is checked by default)
    labelsVisible = toggleLabelsCheckbox.checked;
    
    // Update layer visibility based on initial state
    map.setLayoutProperty(
        'building-labels',
        'visibility',
        labelsVisible ? 'visible' : 'none'
    );
    
    // Add event listener for the checkbox
    toggleLabelsCheckbox.addEventListener('change', () => {
        labelsVisible = toggleLabelsCheckbox.checked;
        
        // Toggle the visibility of the labels layer
        map.setLayoutProperty(
            'building-labels',
            'visibility',
            labelsVisible ? 'visible' : 'none'
        );
        
        // Optional: Add subtle animation to make the transition smoother
        if (labelsVisible) {
            // Could add fade-in animation here
            console.log('Labels now visible');
        } else {
            // Could add fade-out animation here
            console.log('Labels now hidden');
        }
    });
});

// https://nominatim.oklabflensburg.de/search?q=norderstra%C3%9Fe%2049,%20flensburg
// https://nominatim.oklabflensburg.de/search?q=norderstra%C3%9Fe%2049,%20flensburg&format=geocodejson
// https://nominatim.oklabflensburg.de/search?q=norderstra%C3%9Fe%2049,%20flensburg&format=geocodejson&addressdetails=1
