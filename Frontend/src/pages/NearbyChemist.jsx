import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ShieldCheck, ListFilter } from 'lucide-react';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const verifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const unverifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const DEFAULT_LOCATION = [26.4499, 80.3319];

const distanceKm = (from, to) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const NearbyChemist = () => {
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [verifiedChemists, setVerifiedChemists] = useState([]);
  const [osmChemists, setOsmChemists] = useState([]);
  const [activeTab, setActiveTab] = useState('verified');
  const [loading, setLoading] = useState(true);

  const fetchNearbyChemists = async (lat, lng) => {
    try {
      const response = await api.get(`/chemists/nearby?lat=${lat}&lng=${lng}&radius=5000`);
      setVerifiedChemists(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.log('Verified chemists fetch failed:', error.message);
      setVerifiedChemists([]);
    }
  };

  const fetchNearbyPharmaciesFromOSM = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=pharmacy&format=json&limit=15&viewbox=${lng - 0.05},${lat + 0.05},${lng + 0.05},${lat - 0.05}&bounded=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      const pharmacies = response.data.map((p) => ({
        id: p.place_id,
        name: p.display_name.split(',')[0],
        address: p.display_name,
        coordinates: { lat: parseFloat(p.lat), lng: parseFloat(p.lon) },
        isVerified: false,
        source: 'OpenStreetMap',
        distance: distanceKm([lat, lng], [parseFloat(p.lat), parseFloat(p.lon)])
      }));

      setOsmChemists(pharmacies);
    } catch (error) {
      console.log('OSM fetch failed:', error.message);
      setOsmChemists([]);
    }
  };

  useEffect(() => {
    const load = async (lat, lng) => {
      await Promise.all([
        fetchNearbyChemists(lat, lng),
        fetchNearbyPharmaciesFromOSM(lat, lng)
      ]);
      setLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nextLocation = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(nextLocation);
          load(nextLocation[0], nextLocation[1]);
        },
        () => {
          setUserLocation(DEFAULT_LOCATION);
          load(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1]);
        }
      );
    } else {
      load(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1]);
    }
  }, []);

  const allNearby = useMemo(() => {
    const verified = verifiedChemists.map((chemist) => {
      const coords = chemist.coordinates || { lat: userLocation[0], lng: userLocation[1] };
      return {
        ...chemist,
        id: chemist._id,
        name: chemist.shopName,
        isVerified: true,
        source: 'MediGuard',
        distance: coords.lat && coords.lng ? distanceKm(userLocation, [coords.lat, coords.lng]) : null
      };
    });

    return [...verified, ...osmChemists].sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [verifiedChemists, osmChemists, userLocation]);

  const getDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const displayedChemists = activeTab === 'verified'
    ? allNearby.filter((chemist) => chemist.isVerified)
    : allNearby;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="py-12 bg-gradient-to-br from-bg-secondary to-bg-primary border-b border-border-color">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Find Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Chemists</span>
          </h1>
          <p className="text-text-secondary">Leaflet + OpenStreetMap view of verified MediGuard chemists and nearby pharmacies</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-8">
        <div className="space-y-6">
          <div className="rounded-3xl overflow-hidden border border-border-color bg-bg-secondary shadow-2xl">
            <MapContainer center={userLocation} zoom={14} style={{ height: '560px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />

              <Marker position={userLocation} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>

              <Circle center={userLocation} radius={2000} color="cyan" fillOpacity={0.05} />

              {verifiedChemists.map((chemist) => (
                chemist.coordinates?.lat && chemist.coordinates?.lng ? (
                  <Marker key={chemist._id} position={[chemist.coordinates.lat, chemist.coordinates.lng]} icon={verifiedIcon}>
                    <Popup>
                      <strong>{chemist.shopName}</strong><br />
                      ✅ MediGuard Verified<br />
                      License: {chemist.licenseNumber}<br />
                      {chemist.address}<br />
                      📞 {chemist.phone}
                    </Popup>
                  </Marker>
                ) : null
              ))}

              {osmChemists.map((chemist) => (
                <Marker key={chemist.id} position={[chemist.coordinates.lat, chemist.coordinates.lng]} icon={unverifiedIcon}>
                  <Popup>
                    <strong>{chemist.name}</strong><br />
                    ⚠️ Not verified on MediGuard<br />
                    {chemist.address}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Verified Chemists', value: verifiedChemists.length, icon: ShieldCheck },
              { title: 'Nearby Pharmacies', value: osmChemists.length, icon: MapPin },
              { title: 'Coverage Radius', value: '2 km', icon: Navigation },
            ].map((item) => (
              <div key={item.title} className="card flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <item.icon size={22} />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">{item.title}</p>
                  <p className="text-text-primary font-bold text-xl">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-3xl border border-border-color p-5 lg:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Nearby Chemists</h2>
              <p className="text-text-secondary text-sm">Verified chemists and OpenStreetMap pharmacies near you</p>
            </div>
            {loading && <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />}
          </div>

          <div className="flex gap-2 p-1 rounded-2xl bg-bg-primary border border-border-color">
            <button
              type="button"
              onClick={() => setActiveTab('verified')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'verified' ? 'bg-primary text-white' : 'text-text-secondary'}`}
            >
              Verified Chemists
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'text-text-secondary'}`}
            >
              All Nearby
            </button>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {displayedChemists.map((chemist) => {
              const coords = chemist.coordinates || { lat: userLocation[0], lng: userLocation[1] };
              const distance = chemist.distance != null ? `${chemist.distance.toFixed(1)} km` : 'Nearby';

              return (
                <div key={chemist._id || chemist.id} className="p-4 rounded-2xl border border-border-color bg-bg-primary/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-text-primary font-bold">{chemist.shopName || chemist.name}</p>
                      <p className="text-text-secondary text-sm mt-1">{chemist.address}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${chemist.isVerified ? 'bg-success/20 text-success' : 'bg-text-secondary/15 text-text-secondary'}`}>
                      {chemist.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>{distance}</span>
                    <span>{chemist.source}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => getDirections(coords.lat, coords.lng)}
                    className="w-full px-4 py-3 rounded-xl bg-success text-white font-semibold hover:opacity-95 transition-all"
                  >
                    Get Directions
                  </button>
                </div>
              );
            })}

            {!displayedChemists.length && (
              <div className="text-center py-10 text-text-secondary">
                <ListFilter size={28} className="mx-auto mb-3" />
                No chemists available in this view.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyChemist;