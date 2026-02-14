/**
 * AIS Hub Vessel Tracking Service
 * Fetches real-time vessel positions and ship data from AIS Hub API
 * Includes caching, error handling, and rate-limit management
 */

import type { Vessel, CacheEntry, ServiceError } from '../types/maritime';

interface AISHubVessel {
  MMSI: number;
  ShipName: string;
  Longitude: number;
  Latitude: number;
  Speed: number;
  Course: number;
  Status: number;
  Timestamp: string;
}

interface AISHubResponse {
  result: AISHubVessel[];
  api_key?: string;
  error?: string;
}

class VesselTrackerService {
  private apiKey: string;
  private baseUrl = 'https://www.aishub.net/api/v2/';
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private requestQueue: Promise<any>[] = [];
  private rateLimitDelay = 600; // ms between requests (100 req/hour = ~600ms)
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!apiKey) {
      console.warn('[VesselTracker] No API key provided. Service will be limited.');
    }
  }

  /**
   * Fetch vessels in a bounding box
   * @param bounds Object with minLat, maxLat, minLon, maxLon
   * @param useCache Whether to use cached data if available
   */
  async getVesselsInBounds(
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
    useCache = true
  ): Promise<Vessel[]> {
    const cacheKey = `vessels_${bounds.minLat}_${bounds.maxLat}_${bounds.minLon}_${bounds.maxLon}`;

    // Check cache
    if (useCache && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('[VesselTracker] Returning cached vessels');
        return cached.data as Vessel[];
      }
    }

    try {
      // Rate limiting
      await this.enforceRateLimit();

      const params = new URLSearchParams({
        api_key: this.apiKey,
        xmin: bounds.minLon.toString(),
        xmax: bounds.maxLon.toString(),
        ymin: bounds.minLat.toString(),
        ymax: bounds.maxLat.toString(),
        output: 'json',
      });

      const url = `${this.baseUrl}vessels?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`AIS Hub API error: ${response.status} ${response.statusText}`);
      }

      const data: AISHubResponse = await response.json();

      if (data.error) {
        throw new Error(`AIS Hub error: ${data.error}`);
      }

      // Transform AIS Hub format to our Vessel type
      const vessels: Vessel[] = (data.result || []).map((v) => ({
        id: `vessel_${v.MMSI}`,
        mmsi: v.MMSI,
        name: v.ShipName || 'Unknown Vessel',
        latitude: v.Latitude,
        longitude: v.Longitude,
        speed: v.Speed || 0,
        course: v.Course || 0,
        status: v.Status || 0,
        timestamp: v.Timestamp,
        source: 'AIS Hub',
        type: 'commercial',
      }));

      // Update cache
      this.cache.set(cacheKey, {
        data: vessels,
        timestamp: Date.now(),
      });

      console.log(`[VesselTracker] Fetched ${vessels.length} vessels`);
      return vessels;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[VesselTracker] Error fetching vessels:', message);
      throw {
        service: 'AIS Hub',
        message,
        timestamp: new Date().toISOString(),
      } as ServiceError;
    }
  }

  /**
   * Fetch detailed vessel information
   */
  async getVesselDetails(mmsi: number): Promise<Vessel | null> {
    const cacheKey = `vessel_detail_${mmsi}`;

    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached.data as Vessel;
    }

    try {
      await this.enforceRateLimit();

      const params = new URLSearchParams({
        api_key: this.apiKey,
        mmsi: mmsi.toString(),
        output: 'json',
      });

      const url = `${this.baseUrl}vessel?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) return null;

      const data: AISHubResponse = await response.json();
      if (!data.result || data.result.length === 0) return null;

      const v = data.result[0];
      const vessel: Vessel = {
        id: `vessel_${v.MMSI}`,
        mmsi: v.MMSI,
        name: v.ShipName || 'Unknown Vessel',
        latitude: v.Latitude,
        longitude: v.Longitude,
        speed: v.Speed || 0,
        course: v.Course || 0,
        status: v.Status || 0,
        timestamp: v.Timestamp,
        source: 'AIS Hub',
        type: 'commercial',
      };

      this.cache.set(cacheKey, {
        data: vessel,
        timestamp: Date.now(),
      });

      return vessel;
    } catch (error) {
      console.error('[VesselTracker] Error fetching vessel details:', error);
      return null;
    }
  }

  /**
   * Get vessels with alerts (suspicious activity)
   */
  async getVesselsWithAlerts(bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }): Promise<Vessel[]> {
    const vessels = await this.getVesselsInBounds(bounds, true);

    // Filter for suspicious patterns
    return vessels.filter((v) => {
      // Flag vessels with no name, stopped in open ocean, or unusual patterns
      const hasNoName = !v.name || v.name === 'Unknown Vessel';
      const isStopped = v.speed === 0 && this.isOpenOcean(v.latitude, v.longitude);
      const hasNoSignal = !v.timestamp || this.isDataStale(v.timestamp);

      return hasNoName || isStopped || hasNoSignal;
    });
  }

  /**
   * Rate limiting to respect API limits (100 req/hour)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delayNeeded = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delayNeeded));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    return age < this.cacheTimeout;
  }

  /**
   * Check if location is in open ocean (rough heuristic)
   */
  private isOpenOcean(lat: number, lon: number): boolean {
    // Rough check: if not near major coastlines/ports
    // In production, use a coastline database
    const nearCoast = Math.abs(lat % 10) < 2 && Math.abs(lon % 10) < 2;
    return !nearCoast;
  }

  /**
   * Check if vessel data is stale
   */
  private isDataStale(timestamp: string): boolean {
    const vesselTime = new Date(timestamp).getTime();
    const now = Date.now();
    const staleness = now - vesselTime;
    return staleness > 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[VesselTracker] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export default VesselTrackerService;
