import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTreeLocations } from '@/hooks/useImpactStats';
import { TreePine, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom green tree icon
const treeIcon = L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

L.Marker.prototype.options.icon = defaultIcon;

export function TreeMap() {
  const { data: treeLocations, isLoading } = useTreeLocations();
  const [mapReady, setMapReady] = useState(false);

  // Default center: Vietnam
  const defaultCenter: [number, number] = [16.0, 108.0];
  const defaultZoom = 6;

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Bản đồ cây đã trồng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Bản đồ cây đã trồng
        </CardTitle>
        <CardDescription>
          {treeLocations?.length || 0} cây đã được định vị trên bản đồ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mapReady && (
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {treeLocations?.map((tree) => (
                <Marker
                  key={tree.id}
                  position={[Number(tree.latitude), Number(tree.longitude)]}
                  icon={defaultIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <TreePine className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{tree.tree_type}</span>
                      </div>
                      {tree.location && (
                        <p className="text-sm text-muted-foreground mb-1">
                          📍 {tree.location}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        🗓️ {new Date(tree.planted_at).toLocaleDateString('vi-VN')}
                      </p>
                      {tree.verified && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                          ✓ Đã xác minh
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {(!treeLocations || treeLocations.length === 0) && (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <TreePine className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Chưa có cây nào được định vị GPS
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Trồng cây và thêm vị trí GPS để hiển thị trên bản đồ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
