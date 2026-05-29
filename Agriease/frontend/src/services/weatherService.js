import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "23b206a3fc43436ca9b192042260402";

export const getWeather = async (city) => {
  if (!API_KEY) {
    throw new Error("Weather API key is not configured");
  }

  const response = await axios.get(
    "https://api.weatherapi.com/v1/current.json",
    {
      params: {
        key: API_KEY,
        q: city,
      },
    }
  );

  return response.data;
};
