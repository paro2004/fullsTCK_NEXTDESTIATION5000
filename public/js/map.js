
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const token = window.mapToken;
    if (!token) {
        mapContainer.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 1rem; font-size: 16px; color: #666; text-align: center; padding: 20px;">
                Map token is not available.
            </div>
        `;
        return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [88.3639, 22.5726],
        zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.on('load', () => {
        map.resize();

        const coords = mapContainer.dataset.coordinates ? JSON.parse(mapContainer.dataset.coordinates) : null;
        if (coords && Array.isArray(coords) && coords.length === 2) {
            const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
                .setHTML('<div style="padding: 10px 14px; background: #ff8e8e; color: #fff; border-radius: 10px; font-size: 14px; font-weight: 600;">Exact location will be provided after booking</div>');

            const markerEl = document.createElement('div');
            Object.assign(markerEl.style, {
                width: '30px',
                height: '40px',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
            });

            const pinBody = document.createElement('div');
            Object.assign(pinBody.style, {
                width: '30px',
                height: '30px',
                borderRadius: '50% 50% 50% 50%',
                backgroundColor: '#cc2a2a',
                border: '2px solid #fff',
                boxShadow: '0 0 18px 8px rgba(139, 0, 0, 0.25)',
                position: 'absolute',
                top: '0',
                left: '0',
            });

            const pinTip = document.createElement('div');
            Object.assign(pinTip.style, {
                width: '0',
                height: '0',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '16px solid #c93434',
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
            });

            markerEl.appendChild(pinBody);
            markerEl.appendChild(pinTip);

            const marker = new mapboxgl.Marker({ element: markerEl, anchor: 'bottom' })
                .setLngLat(coords)
                .setPopup(popup)
                .addTo(map);

            markerEl.addEventListener('mouseenter', () => popup.addTo(map));
            markerEl.addEventListener('mouseleave', () => popup.remove());

            map.flyTo({ center: coords, zoom: 12 });
        }
    });
});


