const haversineDistance = (lat1, lon1, lat2, lon2) => {

    const EARTH_RADIUS_KM = 6371; 
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    
    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    // Haversine formula core 'a'
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    // Central angle 'c'
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Final Distance (D) in KM
    const distance = EARTH_RADIUS_KM * c; 

    return distance;
};

module.exports = haversineDistance