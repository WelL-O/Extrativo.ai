'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationData {
  latitude: number
  longitude: number
  count: number
  category?: string
}

interface LeafletMapProps {
  locations: LocationData[]
}

// Componente para ajustar o zoom do mapa baseado nos pontos
function MapBounds({ locations }: { locations: LocationData[] }) {
  const map = useMap()

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map(loc => [loc.latitude, loc.longitude] as [number, number])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [locations, map])

  return null
}

export default function LeafletMap({ locations }: LeafletMapProps) {
  // Centro padrão (Brasil)
  const defaultCenter: [number, number] = [-14.235, -51.9253]

  // Agrupa localizações próximas
  const clusteredLocations = locations.reduce((acc, loc) => {
    const key = `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`
    if (!acc[key]) {
      acc[key] = { ...loc, count: 0 }
    }
    acc[key].count += loc.count
    return acc
  }, {} as Record<string, LocationData>)

  const points = Object.values(clusteredLocations)

  // Calcular raio baseado na contagem
  const getRadius = (count: number) => {
    const maxCount = Math.max(...points.map(p => p.count))
    const minRadius = 5
    const maxRadius = 30
    return minRadius + ((count / maxCount) * (maxRadius - minRadius))
  }

  // Cor baseada na intensidade
  const getColor = (count: number) => {
    const maxCount = Math.max(...points.map(p => p.count))
    const intensity = count / maxCount

    if (intensity > 0.7) return '#ef4444' // vermelho
    if (intensity > 0.4) return '#f59e0b' // laranja
    return '#3b82f6' // azul
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={4}
      style={{ height: '400px', width: '100%' }}
      className="rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds locations={locations} />

      {points.map((loc, idx) => (
        <CircleMarker
          key={idx}
          center={[loc.latitude, loc.longitude]}
          radius={getRadius(loc.count)}
          fillColor={getColor(loc.count)}
          color="#fff"
          weight={2}
          opacity={0.8}
          fillOpacity={0.6}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{loc.count} lead(s)</div>
              {loc.category && (
                <div className="text-muted-foreground">{loc.category}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
