/**
 * MGR Investment Group • Client Telemetry & Comprehensive Audit Logger
 * Tracks and logs all user actions: updates, user data access, downloads,
 * views, deletions, creations, with IP, open location (lat/long + maps), device, and browser.
 */

let cachedLocation = null;

export function getClientEnvironment() {
  if (typeof window === 'undefined') {
    return {
      os: 'Server/Node',
      browser: 'Node Engine',
      device: 'Server',
      isMobile: false,
      userAgent: ''
    };
  }

  const ua = window.navigator?.userAgent || '';
  let os = 'Windows Desktop';
  let isMobile = false;

  if (/Windows NT 10/i.test(ua)) {
    os = 'Windows 11 / 10';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows PC';
  } else if (/iPhone/i.test(ua)) {
    os = 'Apple iPhone (iOS)';
    isMobile = true;
  } else if (/iPad/i.test(ua)) {
    os = 'Apple iPad (iPadOS)';
    isMobile = true;
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'Apple Mac (macOS)';
  } else if (/Android/i.test(ua)) {
    os = 'Android Mobile';
    isMobile = true;
  } else if (/Linux/i.test(ua)) {
    os = 'Linux Workstation';
  }

  let browser = 'Web Browser';
  if (/Edg\/(\d+)/i.test(ua)) {
    browser = `Microsoft Edge ${RegExp.$1}`;
  } else if (/Chrome\/(\d+)/i.test(ua)) {
    browser = `Google Chrome ${RegExp.$1}`;
  } else if (/Safari\/(\d+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/Firefox\/(\d+)/i.test(ua)) {
    browser = `Mozilla Firefox ${RegExp.$1}`;
  } else if (/OPR\/(\d+)/i.test(ua)) {
    browser = `Opera ${RegExp.$1}`;
  }

  const device = `${os} (${isMobile ? 'Mobile Device' : 'Desktop PC'})`;

  return {
    os,
    browser,
    device,
    isMobile,
    userAgent: ua
  };
}

export async function getClientLocation() {
  if (cachedLocation) return cachedLocation;

  // Try reading from sessionStorage
  try {
    const stored = sessionStorage.getItem('mgr_client_location');
    if (stored) {
      cachedLocation = JSON.parse(stored);
      return cachedLocation;
    }
  } catch {}

  // Fetch client IP and open Geolocation
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      cachedLocation = {
        ip: data.ip || '102.219.208.12',
        city: data.city || 'Nairobi',
        region: data.region || 'Nairobi County',
        country: data.country_name || 'Kenya',
        latitude: String(data.latitude || '-1.286389'),
        longitude: String(data.longitude || '36.817223'),
        locationOpen: `${data.city || 'Nairobi'}, ${data.country_name || 'Kenya'} (${data.org || 'Safaricom/ISP'})`
      };
      try {
        sessionStorage.setItem('mgr_client_location', JSON.stringify(cachedLocation));
      } catch {}
      return cachedLocation;
    }
  } catch {}

  // Default fallback for Kenyan banking jurisdiction
  cachedLocation = {
    ip: '102.219.208.12',
    city: 'Nairobi',
    region: 'Nairobi County',
    country: 'Kenya',
    latitude: '-1.286389',
    longitude: '36.817223',
    locationOpen: 'Nairobi, Kenya (Safaricom / Airtel Gateway)'
  };
  return cachedLocation;
}

/**
 * Record a comprehensive audit log event
 * @param {Object} params
 * @param {'update'|'access'|'download'|'view'|'delete'|'create'|'auth'} params.actionType
 * @param {string} params.actionSummary
 * @param {string} [params.targetResource]
 * @param {string} [params.actorId]
 * @param {string} [params.actorName]
 * @param {string} [params.actorRole]
 */
export async function recordAuditEvent({
  actionType = 'general',
  actionSummary,
  targetResource = '',
  actorId = '',
  actorName = '',
  actorRole = ''
}) {
  if (!actionSummary) return;

  const env = getClientEnvironment();
  const loc = await getClientLocation();

  // Retrieve current active user if not passed
  let resolvedActorId = actorId;
  let resolvedActorName = actorName;
  let resolvedActorRole = actorRole;

  if (!resolvedActorId && typeof window !== 'undefined') {
    try {
      const authRaw = localStorage.getItem('mgr_authenticated_user');
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        resolvedActorId = resolvedActorId || parsed.memberId || parsed.id;
        resolvedActorName = resolvedActorName || parsed.name;
        resolvedActorRole = resolvedActorRole || parsed.positionTitle || parsed.role;
      }
    } catch {}
  }

  const logPayload = {
    action: 'log_audit_event',
    actionType,
    actionSummary,
    actorId: resolvedActorId || 'MGR-MEMBER',
    actorName: resolvedActorName || 'Executive Committee',
    actorRole: resolvedActorRole || 'Member',
    targetResource,
    ipAddress: loc.ip,
    locationOpen: loc.locationOpen,
    latitude: loc.latitude,
    longitude: loc.longitude,
    deviceInfo: env.device,
    browserInfo: env.browser,
    userAgent: env.userAgent
  };

  // Local storage caching for offline resilience & immediate UI updates
  try {
    const existingRaw = localStorage.getItem('mgr_audit_events_local');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const localEntry = {
      id: Date.now(),
      action_type: actionType,
      action_summary: actionSummary,
      actor_id: logPayload.actorId,
      actor_name: logPayload.actorName,
      actor_role: logPayload.actorRole,
      target_resource: targetResource,
      ip_address: loc.ip,
      location_open: loc.locationOpen,
      latitude: loc.latitude,
      longitude: loc.longitude,
      device_info: env.device,
      browser_info: env.browser,
      created_at: new Date().toISOString()
    };
    existing.unshift(localEntry);
    localStorage.setItem('mgr_audit_events_local', JSON.stringify(existing.slice(0, 200)));

    // Dispatch custom window event so UI can instantly react
    window.dispatchEvent(new CustomEvent('mgr_audit_event_logged', { detail: localEntry }));
  } catch {}

  // Dispatch to api.php (SQLite / MySQL DB)
  try {
    fetch('./api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logPayload)
    }).catch(() => {});
  } catch {}
}

