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
    <div className="mg-root">
      <section className="mg-hero py-12 bg-bg-0 border-b border-line overflow-hidden">
        <div className="mg-hero__bg-grid" aria-hidden />
        <div className="mg-container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="mg-badge mg-badge--green mb-4">
              <span className="mg-badge__dot" />
              Geo-Verification Active
            </span>
            <h1 className="mg-hero__headline text-4xl md:text-6xl mb-4">Find Verified Chemists</h1>
            <p className="mg-hero__sub mx-auto">Locate pharmacies that have been strictly verified for authentic medicine storage and licensing.</p>
          </div>
        </div>
      </section>

      <div className="mg-container py-12">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Verified Chemists', value: verifiedChemists.length, icon: ShieldCheck, color: 'text-green', bg: 'bg-green-dim' },
              { title: 'Nearby Pharmacies', value: osmChemists.length, icon: MapPin, color: 'text-accent', bg: 'bg-accent-glow' },
              { title: 'Coverage Radius', value: '2 km', icon: Navigation, color: 'text-amber', bg: 'bg-amber/5' },
            ].map((item) => (
              <div key={item.title} className="mg-card flex items-center gap-5 p-6 border-line/40">
                <div className={`p-4 rounded-2xl ${item.bg} ${item.color} shadow-sm`}>
                  <item.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-lo font-bold mb-1">{item.title}</p>
                  <p className="text-text-hi font-bold text-3xl">{item.value}</p>
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

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {displayedChemists.map((chemist) => {
              const coords = chemist.coordinates || { lat: userLocation[0], lng: userLocation[1] };
              const distance = chemist.distance != null ? `${chemist.distance.toFixed(1)} km` : 'Nearby';

              return (
                <div key={chemist._id || chemist.id} className="mg-card group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-text-hi group-hover:text-accent transition-colors">
                        {chemist.shopName || chemist.name}
                      </p>
                      <p className="text-text-md text-sm mt-1 leading-relaxed">{chemist.address}</p>
                    </div>
                    {chemist.isVerified ? (
                      <span className="mg-badge mg-badge--green">Verified</span>
                    ) : (
                      <span className="mg-badge bg-bg-2 border-line text-text-lo">Standard</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs font-semibold uppercase tracking-widest text-text-lo">
                    <span className="flex items-center gap-1.5">
                      <Navigation size={12} className="text-accent" />
                      {distance}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-accent" />
                      {chemist.source}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => getDirections(coords.lat, coords.lng)}
                    className="mg-btn mg-btn--primary w-full mt-6 justify-center"
                  >
                    Get Directions
                  </button>
                </div>
              );
            })}

            {!displayedChemists.length && (
              <div className="text-center py-16 bg-bg-1 rounded-3xl border border-line">
                <ListFilter size={40} className="mx-auto mb-4 text-text-lo" />
                <p className="text-text-md">No chemists found in this criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyChemist;