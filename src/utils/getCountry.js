const getCountry = async () => {
  try {
    if ("geolocation" in window.navigator) {
      const position = await new Promise((resolve, reject) => {
        window.navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Use a reverse geocoding service to get the country based on coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      const data = await response.json();

      if (data && data.address && data.address.country) {
        return data.address;
      }
    }

    // Fallback: If geolocation is not supported or the country couldn't be determined, return null or a default value.
    return null;
  } catch (error) {
    console.error("Error fetching country:", error);
    return null;
  }
};

export default getCountry;
