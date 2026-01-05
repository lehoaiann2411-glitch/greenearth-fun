import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

L.Marker.prototype.options.icon = defaultIcon;

export function TreeMap() {
  const [mapReady, setMapReady] = useState(false);

  // Default center: Vietnam
  const defaultCenter: [number, number] = [16.0, 108.0];
  const defaultZoom = 6;

  useEffect(() => {
    setMapReady(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Bản đồ cây đã trồng
        </CardTitle>
        <CardDescription>
          Xem vị trí cây được trồng từ các chiến dịch
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
            </MapContainer>
          </div>
        )}

        <div className="flex flex-col items-center justify-center h-[200px] text-center">
          <TreePine className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Tham gia chiến dịch trồng cây để xem vị trí trên bản đồ
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Các vị trí sẽ được cập nhật từ dữ liệu chiến dịch
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
