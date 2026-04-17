import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

type MapMarker = {
  lat: number;
  lng: number;
  label?: string;
  isPrimary?: boolean;
};

type LeafletMapCardProps = {
  height?: number;
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  routePath?: Array<{ lat: number; lng: number }>;
  rounded?: boolean;
  animateBus?: boolean;
};

export function LeafletMapCard({
  height = 260,
  center,
  zoom = 12,
  markers = [],
  routePath = [],
  rounded = true,
  animateBus = false,
}: LeafletMapCardProps) {
  const html = useMemo(() => {
    const payload = JSON.stringify({ center, zoom, markers, routePath, animateBus });

    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
      body { background: #dbe4e2; }
      .label-pill {
        background: #1b5e20;
        color: #f7fbfa;
        border-radius: 14px;
        padding: 4px 10px;
        font: 600 12px/1.2 -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.22);
      }
      .bus-marker {
        width: 24px;
        height: 24px;
        border-radius: 12px;
        background: #1b5e20;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 0 0 6px rgba(27, 94, 32, 0.2);
        animation: bob 1.2s ease-in-out infinite;
      }
      @keyframes bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const data = ${payload};
      const map = L.map('map', { zoomControl: false, attributionControl: false }).setView(
        [data.center.lat, data.center.lng],
        data.zoom
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      if (data.routePath.length > 1) {
        L.polyline(data.routePath.map((p) => [p.lat, p.lng]), {
          color: '#8BC34A',
          weight: 10,
          opacity: 0.22,
        }).addTo(map);

        L.polyline(data.routePath.map((p) => [p.lat, p.lng]), {
          color: '#1B5E20',
          weight: 5,
          opacity: 0.9,
        }).addTo(map);
      }

      data.markers.forEach((marker) => {
        const dot = L.circleMarker([marker.lat, marker.lng], {
          radius: marker.isPrimary ? 8 : 6,
          color: marker.isPrimary ? '#1B5E20' : '#2E7D32',
          weight: 2,
          fillColor: marker.isPrimary ? '#1B5E20' : '#F1FFF2',
          fillOpacity: 1,
        }).addTo(map);

        if (marker.label) {
          dot.bindTooltip('<span class="label-pill">' + marker.label + '</span>', {
            permanent: true,
            direction: 'top',
            offset: [0, -8],
            className: '',
          });
        }
      });

      if (data.animateBus && data.routePath.length > 1) {
        const bus = L.marker([data.routePath[0].lat, data.routePath[0].lng], {
          icon: L.divIcon({
            className: '',
            html: '<div class="bus-marker">🚌</div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(map);

        let i = 0;
        setInterval(() => {
          i = (i + 1) % data.routePath.length;
          bus.setLatLng([data.routePath[i].lat, data.routePath[i].lng]);
        }, 1600);
      }
    </script>
  </body>
</html>`;
  }, [center, zoom, markers, routePath, animateBus]);

  if (Platform.OS === 'web') {
    const iframe = React.createElement('iframe', {
      srcDoc: html,
      style: styles.iframe,
      sandbox: 'allow-scripts allow-same-origin',
      title: 'Leaflet Bus Map',
    });

    return <View style={[styles.container, { height }, rounded && styles.rounded]}>{iframe}</View>;
  }

  return (
    <View style={[styles.container, { height }, rounded && styles.rounded]}>
      <WebView originWhitelist={['*']} source={{ html }} style={styles.webview} scrollEnabled={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#DCE5E3',
  },
  rounded: {
    borderRadius: 28,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  iframe: {
    borderWidth: 0,
    width: '100%',
    height: '100%',
  },
});
