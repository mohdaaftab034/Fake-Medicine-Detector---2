import { useState, useEffect, useCallback } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
          // Set default location if geolocation fails
          setLocation({
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: null,
          });
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      // Set default location (Bangalore)
      setLocation({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: null,
      });
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    location,
    loading,
    error,
    getLocation,
  };
};
