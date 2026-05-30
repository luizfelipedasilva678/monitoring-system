function parseOrigins(value: string | undefined): string[] {
  if (!value) {
    return ['http://localhost:5173'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const LOCAL_NETWORK_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/;

export function isAllowedCameraOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  const allowed = parseOrigins(process.env.CAMERA_APP_ORIGIN);
  if (allowed.includes(origin)) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production') {
    return LOCAL_NETWORK_ORIGIN.test(origin);
  }

  return false;
}

export function getCameraCorsOrigin():
  | string[]
  | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  return (origin, callback) => {
    callback(null, isAllowedCameraOrigin(origin));
  };
}
