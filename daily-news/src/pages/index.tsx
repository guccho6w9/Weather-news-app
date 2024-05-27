// pages/index.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/app/globals.css';

// API keys
const NEWS_API_KEY = 'UC8huf3pEYUUTVWejnTzOlJBd98BlsrxSeIhDupW';
const WEATHER_API_KEY = 'f996ff1ddc2505487b9e0b8ad3411379';

// API URLs
const NEWS_API_URL = (country: string) => `https://api.thenewsapi.com/v1/news/top?api_token=${NEWS_API_KEY}&locale=${country}&limit=3`;
const WEATHER_API_URL = (city: string, country: string) => `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${WEATHER_API_KEY}&units=metric`;

interface Article {
  title: string;
  image_url: string | null;
}

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

const Home: React.FC = () => {
  const [news, setNews] = useState<Article[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [country, setCountry] = useState<string>('us');
  const [city, setCity] = useState<string>('New York');
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedNewsIndex, setSelectedNewsIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch news articles based on the country
  const fetchNews = async (country: string) => {
    try {
      const response = await axios.get(NEWS_API_URL(country));
      setNews(response.data.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  // Fetch weather data based on the city and country
  const fetchWeather = async (city: string, country: string) => {
    try {
      const response = await axios.get(WEATHER_API_URL(city, country));
      const data = response.data;
      setWeather({
        temp: data.main.temp,
        description: data.weather[0].description,
        icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  // Fetch news and weather data when the component mounts and when the country or city changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchNews(country);
      await fetchWeather(city, country);
      setLoading(false);
    };
    fetchData();
  }, [country, city]);

  // Function to get a valid image URL or a placeholder if the image URL is null
  const getValidImageUrl = (url: string | null) => {
    return url ? url : 'https://via.placeholder.com/800x400?text=No+Image+Available';
  };

  // Handle input change and update city and country state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle search click, update city and country, and fetch data
  const handleSearchClick = () => {
    const [newCity, newCountry] = inputValue.split(',').map(s => s.trim());
    setCity(newCity);
    setCountry(newCountry);
  };

  if (loading) {
    return <div>Cargando noticias y clima...</div>;
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <h1 className="text-center text-4xl font-bold mb-8">Noticias Diarias</h1>

      {/* Weather Section */}
      <div className="mb-8">
        <h2 className="text-center text-2xl mb-4">Clima Actual</h2>
        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ingresa la ciudad y país (e.g., Santiago del estero, ar)"
            className="border text-black p-2 rounded w-1/2"
          />
          <button
            onClick={handleSearchClick}
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Buscar
          </button>
        </div>
        {weather && (
          <div className="text-center">
            <img src={weather.icon} alt={weather.description} className="mx-auto" />
            <div>{`${weather.temp}°C - ${weather.description}`}</div>
          </div>
        )}
      </div>

      {/* News Section */}
      <div className="relative">
        {news.length > 0 && (
          <div>
            <img
              src={getValidImageUrl(news[selectedNewsIndex]?.image_url)}
              alt={news[selectedNewsIndex]?.title}
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center p-4 text-xl">
              {news[selectedNewsIndex]?.title}
            </div>
          </div>
        )}
      </div>

      {/* News Navigation */}
      <div className="flex justify-center mt-8 space-x-4">
        {news.map((article, index) => (
          <div
            key={index}
            onClick={() => setSelectedNewsIndex(index)}
            className={`cursor-pointer p-3 border ${selectedNewsIndex === index ? 'border-black' : 'border-gray-300'} rounded-lg mb-4 w-1/5`}
          >
            <img
              src={getValidImageUrl(article.image_url)}
              alt={article.title}
              className="w-full h-24 object-cover"
            />
            <div className="text-center mt-2 text-sm">
              {article.title.slice(0, 40)}{article.title.length > 40 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
