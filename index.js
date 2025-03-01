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
    const loadingSpinner = document.getElementById('labels-loading-spinner');
    
    // Set initial state based on checkbox (which is checked by default)
    labelsVisible = toggleLabelsCheckbox.checked;
    
    // Update layer visibility based on initial state
    map.setLayoutProperty(
        'building-labels',
        'visibility',
        labelsVisible ? 'visible' : 'none'
    );
    
    // Flag to track if the labels have been loaded at least once
    let labelsLoaded = false;
    
    // Function to show the loading spinner with a smooth fade-in
    function showLoadingSpinner() {
        loadingSpinner.style.display = 'block';
        // Force a reflow to ensure the display change takes effect before adding the class
        void loadingSpinner.offsetWidth;
        loadingSpinner.classList.add('visible');
    }
    
    // Function to hide the loading spinner with a smooth fade-out
    function hideLoadingSpinner() {
        loadingSpinner.classList.add('fade-out');
        loadingSpinner.classList.remove('visible');
        
        // Wait for the transition to complete before removing from DOM flow
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            loadingSpinner.classList.remove('fade-out');
        }, 500); // Match this to the transition duration in CSS
    }
    
    // Variable to track if we're waiting for labels to render
    let waitingForLabels = false;
    
    // Create a timer to check when labels are truly loaded
    let labelCheckTimer = null;
    
    // Function to check if all labels are rendered
    function checkLabelsLoaded() {
        // Get information about the map's label features
        const features = map.queryRenderedFeatures({ layers: ['building-labels'] });
        
        // Only start counting once we see at least some labels (the data is actually loading)
        if (features.length > 0) {
            // Keep the spinner visible for at least 3 seconds after some labels appear
            // This gives the impression of progress and avoids flickering
            setTimeout(() => {
                // Check again to ensure all labels are loaded
                const updatedFeatures = map.queryRenderedFeatures({ layers: ['building-labels'] });
                
                // If we have enough labels by now, consider it done
                if (updatedFeatures.length > 10) {
                    // Wait a bit longer to ensure most labels are visible
                    setTimeout(() => {
                        hideLoadingSpinner();
                        waitingForLabels = false;
                        clearInterval(labelCheckTimer);
                        console.log(`Labels fully loaded: ${updatedFeatures.length} labels rendered`);
                    }, 1000);
                }
            }, 2000);
            
            // Clear the interval so we don't keep checking
            clearInterval(labelCheckTimer);
        } else {
            console.log(`Waiting for labels to begin rendering...`);
        }
    }
    
    // Add event listener for the checkbox
    toggleLabelsCheckbox.addEventListener('change', () => {
        labelsVisible = toggleLabelsCheckbox.checked;
        
        if (labelsVisible) {
            // Show loading spinner immediately
            showLoadingSpinner();
            waitingForLabels = true;
            
            // Toggle the visibility of the labels layer
            map.setLayoutProperty(
                'building-labels',
                'visibility',
                'visible'
            );
            
            // Start a timer that checks every 500ms if labels are loaded
            if (labelCheckTimer) {
                clearInterval(labelCheckTimer);
            }
            
            labelCheckTimer = setInterval(checkLabelsLoaded, 500);
            
            // Safety timeout - if labels don't load within 10 seconds, hide spinner
            setTimeout(() => {
                if (waitingForLabels) {
                    hideLoadingSpinner();
                    waitingForLabels = false;
                    clearInterval(labelCheckTimer);
                    console.log('Labels loading timeout reached');
                }
            }, 10000);
            
        } else {
            // For hiding labels, no need to wait
            map.setLayoutProperty(
                'building-labels',
                'visibility',
                'none'
            );
            
            // Clear any existing timer
            if (labelCheckTimer) {
                clearInterval(labelCheckTimer);
                labelCheckTimer = null;
            }
            
            waitingForLabels = false;
            hideLoadingSpinner();
            console.log('Labels now hidden');
        }
    });
    
    // Hide spinner initially
    hideLoadingSpinner();
});

// https://nominatim.oklabflensburg.de/search?q=norderstra%C3%9Fe%2049,%20flensburg
// https://nominatim.oklabflensburg.de/search?q=norderstra%C3%9Fe%2049,%20flensburg&format=geocodejson
// https://nominatim.oklabflensburg.de/search?q=norderstra%C3%9Fe%2049,%20flensburg&format=geocodejson&addressdetails=1
