import { useState, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { MapPin, ExternalLink } from 'lucide-react';
import type { Language } from '../types';

interface OfficeMapProps {
  apiKey: string;
  lat: number;
  lng: number;
  officeName: string;
  address: string;
  lang: Language;
}

function OfficeMarkerWithWindow({
  lat,
  lng,
  officeName,
  address,
}: {
  lat: number;
  lng: number;
  officeName: string;
  address: string;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat, lng }}
        title={officeName}
        onClick={() => setInfoOpen((prev) => !prev)}
      >
        <Pin
          background="#0EA5E9"
          borderColor="#0F172A"
          glyphColor="#FFFFFF"
          scale={1.15}
        />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-slate-900">
            <p className="font-semibold text-xs leading-snug">{officeName}</p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {address}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function MapStatusGuard({
  onUnavailable,
}: {
  onUnavailable: () => void;
}) {
  const status = useApiLoadingStatus();
  useEffect(() => {
    if (
      status === APILoadingStatus.FAILED ||
      status === APILoadingStatus.AUTH_FAILURE
    ) {
      onUnavailable();
    }
  }, [status, onUnavailable]);
  return null;
}

export function OfficeMap({
  apiKey,
  lat,
  lng,
  officeName,
  address,
  lang,
}: OfficeMapProps) {
  const [mapUnavailable, setMapUnavailable] = useState(false);

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  if (!apiKey || mapUnavailable) {
    return (
      <div className="h-[380px] w-full rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-sky-700 text-xs font-semibold">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>
                {lang === 'id'
                  ? 'Lokasi Stasiun Pesisir'
                  : 'Coastal Station Location'}
              </span>
            </div>
            <h4 className="font-display font-bold text-lg text-slate-900">
              {officeName}
            </h4>
            <p className="text-sm text-slate-600 max-w-md">{address}</p>
          </div>
          <span className="font-mono text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg tabular-nums shrink-0">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>

        <div className="my-4 flex-1 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-5 flex flex-col justify-end text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-sky-300 font-medium">
                {lang === 'id'
                  ? 'Koridor Pesisir Teluk Jakarta'
                  : 'Jakarta Bay Coastal Corridor'}
              </p>
              <p className="text-sm text-slate-200 mt-1">
                {lang === 'id'
                  ? 'Koordinat diperbarui secara real-time oleh Super Admin.'
                  : 'Coordinates synced in real time by Super Admin.'}
              </p>
            </div>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              <span>
                {lang === 'id'
                  ? 'Buka di Google Maps'
                  : 'Open in Google Maps'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="h-[380px] w-full rounded-xl overflow-hidden border border-slate-200">
        <APIProvider
          apiKey={apiKey}
          libraries={['marker']}
          language={lang}
          region="ID"
        >
          <MapStatusGuard onUnavailable={() => setMapUnavailable(true)} />
          <GoogleMap
            mapId="DEMO_MAP_ID"
            center={{ lat, lng }}
            defaultZoom={13}
            gestureHandling="cooperative"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <OfficeMarkerWithWindow
              lat={lat}
              lng={lng}
              officeName={officeName}
              address={address}
            />
          </GoogleMap>
        </APIProvider>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="font-mono tabular-nums">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-600 font-medium"
        >
          <span>
            {lang === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}
          </span>
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
