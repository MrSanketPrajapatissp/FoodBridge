import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, MapPin, Clock, Route, Layers, RefreshCw } from 'lucide-react'

// Fix default marker icons (Leaflet + bundlers issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom colored marker icons
const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Available tile layers — all free, no API key, frequently updated
const TILE_LAYERS = {
  'Street': {
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap France',
    maxZoom: 20
  },
  'Detailed': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  'Satellite': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri WorldImagery',
    maxZoom: 19
  },
  'Topo': {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17
  }
}

// Auto-fit map bounds to markers + route
function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds, map])
  return null
}

export default function RouteMap({ ngoLat, ngoLng, donorLat, donorLng, ngoName, donorAddress, distanceKm }) {
  const [route, setRoute] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(true)
  const [activeLayer, setActiveLayer] = useState('Street')

  const ngoPos = [parseFloat(ngoLat), parseFloat(ngoLng)]
  const donorPos = [parseFloat(donorLat), parseFloat(donorLng)]

  useEffect(() => {
    fetchRoute()
  }, [ngoLat, ngoLng, donorLat, donorLng])

  const fetchRoute = async () => {
    setLoadingRoute(true)
    try {
      // OSRM free routing API (no API key needed, updated road data)
      const url = `https://router.project-osrm.org/route/v1/driving/${ngoLng},${ngoLat};${donorLng},${donorLat}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]])
        setRoute(coords)
        setRouteInfo({
          distance: (data.routes[0].distance / 1000).toFixed(1),
          duration: Math.round(data.routes[0].duration / 60)
        })
      }
    } catch (err) {
      console.error('Route fetch failed:', err)
    } finally {
      setLoadingRoute(false)
    }
  }

  const bounds = route ? [...route, ngoPos, donorPos] : [ngoPos, donorPos]
  const tileConfig = TILE_LAYERS[activeLayer]

  return (
    <div className="rounded-card overflow-hidden border border-surface-border shadow-card">
      {/* Route Info Header */}
      <div className="bg-gradient-to-r from-primary/10 via-white to-emerald-50 p-4 border-b border-surface-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Navigation size={16} className="text-primary" />
            </div>
            <h4 className="font-heading font-bold text-text-primary">Pickup Route</h4>
          </div>
          
          {/* Refresh route button */}
          <button
            onClick={fetchRoute}
            disabled={loadingRoute}
            className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-button hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loadingRoute ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-3">
          {routeInfo && (
            <>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-badge border border-surface-border">
                <Route size={14} className="text-primary" />
                <span className="font-mono text-sm font-bold text-primary">{routeInfo.distance} km</span>
                <span className="text-xs text-text-muted">road distance</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-badge border border-surface-border">
                <Clock size={14} className="text-primary" />
                <span className="font-mono text-sm font-bold text-text-primary">~{routeInfo.duration} min</span>
                <span className="text-xs text-text-muted">est. drive</span>
              </div>
            </>
          )}
          {distanceKm && (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-badge border border-surface-border">
              <MapPin size={14} className="text-primary" />
              <span className="font-mono text-sm font-bold text-text-primary">{distanceKm} km</span>
              <span className="text-xs text-text-muted">straight line</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Map Layer Selector */}
      <div className="bg-white border-b border-surface-border px-4 py-2 flex items-center gap-2">
        <Layers size={14} className="text-text-muted" />
        <span className="text-xs font-body text-text-muted mr-1">Map:</span>
        {Object.keys(TILE_LAYERS).map(name => (
          <button
            key={name}
            onClick={() => setActiveLayer(name)}
            className={`text-xs font-heading font-bold px-3 py-1 rounded-badge transition-all ${
              activeLayer === name
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-muted text-text-secondary hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="h-80 md:h-96 relative">
        {loadingRoute && (
          <div className="absolute inset-0 z-[1000] bg-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-card shadow-card">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-body text-sm text-text-secondary">Loading route...</span>
            </div>
          </div>
        )}
        <MapContainer
          center={ngoPos}
          zoom={13}
          className="h-full w-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            key={activeLayer}
            attribution={tileConfig.attribution}
            url={tileConfig.url}
            maxZoom={tileConfig.maxZoom}
          />
          
          <Marker position={ngoPos} icon={ngoIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-emerald-700">📍 Your NGO</p>
                <p className="text-xs text-gray-600">{ngoName}</p>
              </div>
            </Popup>
          </Marker>
          
          <Marker position={donorPos} icon={donorIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-600">🎯 Pickup Point</p>
                <p className="text-xs text-gray-600">{donorAddress}</p>
              </div>
            </Popup>
          </Marker>

          {route && (
            <Polyline
              positions={route}
              pathOptions={{
                color: '#059669',
                weight: 5,
                opacity: 0.85,
                dashArray: '12, 8',
                lineCap: 'round'
              }}
            />
          )}

          <FitBounds bounds={bounds} />
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="bg-surface-muted px-4 py-3 flex items-center gap-6 text-xs font-body text-text-secondary border-t border-surface-border">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
          Your Location
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
          Pickup Point
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-primary inline-block border-dashed border-b-2 border-primary"></span>
          Route
        </div>
        <div className="ml-auto text-xs text-text-muted font-mono">
          Map data updated live via OSM
        </div>
      </div>
    </div>
  )
}
