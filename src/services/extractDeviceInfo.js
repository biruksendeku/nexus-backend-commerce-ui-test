

// import packages
const DeviceDetector = require('device-detector-js');
const deviceDetector = new DeviceDetector();


const extractDeviceInfo = (req) => {
  // IP address (handle proxies)
  const ip = req.headers['x-forwarded-for'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress;

  // Parsed user-agent already available from middleware
  const ua = req.useragent;

  // device-detector-js for device type, brand, etc.
  const device = deviceDetector.parse(req.headers['user-agent']);

  return {
    ip: ip.split(',')[0].trim(),
    browser: {
      name: ua.browser,          // e.g. "Chrome"
      version: ua.version,       // e.g. "123.0.1.2"
      major: ua.version          // you can extract major if needed
    },
    os: {
      name: ua.os,               // e.g. "macOS"
      version: ua.osVersion,     // e.g. "14.3"
      platform: ua.platform      // e.g. "MacIntel"
    },
    device: {
      type: device.device?.type || 'desktop',
      brand: device.device?.brand,
      model: device.device?.model,
      isMobile: device.device?.type === 'mobile',
      isTablet: device.device?.type === 'tablet',
      isBot: device.bot || false
    },
    location: {
      city: null,
      country: null,
      timezone: null
    },
    timestamp: new Date().toISOString()
  };
};


// export the function
module.exports = extractDeviceInfo;
