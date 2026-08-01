export class GeofenceUtil {
  /**
   * Calculates the great-circle distance between two points on the Earth's surface
   * using the Haversine formula in meters.
   */
  public static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const EARTH_RADIUS_METERS = 6371000; // Earth's mean radius in meters

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(EARTH_RADIUS_METERS * c);
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
