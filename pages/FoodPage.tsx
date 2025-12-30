
import React, { useState, useMemo, useEffect } from 'react';
import { Restaurant } from '../types';
import { getNearbyRestaurants } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

const FoodPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(5);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const fetchedRestaurants = await getNearbyRestaurants(latitude, longitude);
          setRestaurants(fetchedRestaurants);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to fetch restaurant data.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied. Please enable location access to find nearby restaurants.");
        setLoading(false);
      }
    );
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter(r => (vegOnly ? r.isVeg : true))
      .filter(r => r.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }, [restaurants, vegOnly, maxDistance]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center py-20">
          <Spinner size="lg" color="border-indigo-600" />
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">Finding tasty spots near you...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="col-span-full text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-300">An Error Occurred</h3>
          <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }

    if (filteredRestaurants.length === 0) {
      return (
        <div className="col-span-full text-center py-20">
          <p className="text-lg text-gray-500 dark:text-gray-400">No restaurants match your criteria. Try adjusting the filters!</p>
        </div>
      );
    }

    return filteredRestaurants.map(r => (
      <Card key={r.id}>
        <img 
          src={`https://source.unsplash.com/800x600/?${encodeURIComponent(r.name)}`} 
          alt={r.name} 
          className="h-48 w-full object-cover" 
        />
        <CardContent>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold flex-1 pr-2">{r.name}</h3>
            <span className="text-sm font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-1 rounded-full whitespace-nowrap">
              ~{r.distance.toFixed(1)} km
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.address}</p>
          {r.isVeg && <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">Strong Vegetarian Options</p>}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">{r.reviewSummary}</p>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-bold">Find Your Next Meal</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center">
              <input
                id="veg-only"
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="veg-only" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Veg Only
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="distance" className="text-sm text-gray-900 dark:text-gray-300">
                Distance: {maxDistance} km
              </label>
              <input
                id="distance"
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                className="w-32 cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default FoodPage;
