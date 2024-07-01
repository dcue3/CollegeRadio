const axios = require('axios');
const fs = require('fs');
const collegelist = require('./wiki_data.json'); // Your existing JSON file

const fetchLocation = async (name) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: name,
        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      const countryComponent = response.data.results[0].address_components.find(component => component.types.includes('country'));
      const isUSA = countryComponent && countryComponent.short_name === 'US';
      return isUSA ? location : null;
    } else {
      console.error('No results found for the given university name:', name);
      return null;
    }
  } catch (error) {
    console.error('Error fetching geocode for', name, ':', error);
    return null;
  }
};

const fetchAllLocations = async () => {
  const updatedCollegeList = await Promise.all(collegelist.map(async (college) => {
    const location = await fetchLocation(college.college);
    return {
      ...college,
      location
    };
  }));

  fs.writeFileSync('colleges_with_locations.json', JSON.stringify(updatedCollegeList, null, 2));
};

fetchAllLocations();
