export type Coordinates = {
    latitude: number;
    longitude: number;
};

export function haversineDistance(loc1: Coordinates, loc2: Coordinates): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Rayon de la Terre en km

    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
