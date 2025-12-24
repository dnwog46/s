import type { APIRoute } from 'astro';

interface GeoData {
  source: string;
  ip: string;
  country: string;
  countryName: string;
  city: string;
  region: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  accurate: boolean;
  error?: string;
}

interface IpApiResponse {
  status?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  query?: string;
}

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^::1$/,
  /^fd[0-9a-f]{2}:.+/i,
  /^fe80:.+/i,
  /^localhost$/i
];

const isValidPublicIP = (ip: string | null | undefined): boolean => {
  if (!ip || ip === '未知') return false;
  if (!ip.includes('.') && !ip.includes(':')) return false;
  return !PRIVATE_IP_RANGES.some(pattern => pattern.test(ip));
};

const ipCache = new Map<string, { data: GeoData; expiresAt: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5分钟

async function fetchIpInfo(ip: string): Promise<GeoData> {
  const cached = ipCache.get(ip);
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, source: `${cached.data.source} (cache)` };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,query`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Astro-GeoIP/1.0)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: IpApiResponse = await response.json();

    if (data.status === 'fail' || !data.countryCode) {
      throw new Error('Invalid response from ip-api.com');
    }

    const geoData: GeoData = {
      source: 'ip-api.com',
      ip: data.query || ip,
      country: data.countryCode,
      countryName: data.country || data.countryCode,
      city: data.city || '',
      region: data.regionName || data.region || '',
      timezone: data.timezone || '',
      latitude: data.lat || null,
      longitude: data.lon || null,
      accurate: true
    };

    ipCache.set(ip, {
      data: geoData,
      expiresAt: Date.now() + CACHE_TTL
    });

    if (ipCache.size > 1000) {
      const firstKey = ipCache.keys().next().value;
      if (firstKey) ipCache.delete(firstKey);
    }

    return geoData;
  } catch (error) {
    console.error('IP detection failed:', error);

    return {
      source: 'fallback',
      ip,
      country: 'US',
      countryName: 'United States',
      city: '',
      region: '',
      timezone: '',
      latitude: null,
      longitude: null,
      accurate: false,
      error: 'IP geolocation service unavailable'
    };
  }
}

export const GET: APIRoute = async ({ request }) => {
  let ip = '未知';

  const xff = request.headers.get('x-forwarded-for');
  const cfIp = request.headers.get('cf-connecting-ip');
  const realIp = request.headers.get('x-real-ip');

  if (xff) {
    const ips = xff.split(',').map(s => s.trim());
    const publicIp = ips.find(i => isValidPublicIP(i));
    if (publicIp) ip = publicIp;
  }

  if (!isValidPublicIP(ip)) {
    if (isValidPublicIP(cfIp)) ip = cfIp!;
    else if (isValidPublicIP(realIp)) ip = realIp!;
  }

  if (!isValidPublicIP(ip)) {
    return new Response(JSON.stringify({
      source: 'internal',
      ip,
      country: 'US',
      countryName: 'United States',
      city: '',
      region: '',
      timezone: '',
      latitude: null,
      longitude: null,
      accurate: false,
      error: 'Invalid or Private IP address detected'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
      }
    });
  }

  try {
    const result = await fetchIpInfo(ip);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-Geo-Source': result.source
      }
    });
  } catch (error) {
    console.error('API error:', error);

    return new Response(JSON.stringify({
      source: 'error',
      ip,
      country: 'US',
      countryName: 'United States',
      city: '',
      region: '',
      timezone: '',
      latitude: null,
      longitude: null,
      accurate: false,
      error: 'Server error'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60'
      }
    });
  }
};
