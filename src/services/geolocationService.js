

// import package
const axios = require('axios'); // for api call


// to get location info from ip address of the 
// reset requesting client
const getLocationFromIP = async (ip) => {
    try {
        // skip localhost IPs
        if (ip === '::1' || ip === '127.0.0.1') {
            return {
                city: 'Local',
                country: 'Local',
                timezone: 'Local'
            };
        }
        
        // using free ipapi.co service
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        
        return {
            city: response.data.city,
            country: response.data.country_name,
            timezone: response.data.timezone,
            latitude: response.data.latitude,
            longitude: response.data.longitude
        };
    } catch (error) {
        console.error('Geolocation error:', error);
        return {
        	// the best way would be to label them as "Unknown"
            city: 'Unknown',
            country: 'Unknown',
            timezone: 'Unknown'
        };
    }
};


// export the config
module.exports = getLocationFromIP;
