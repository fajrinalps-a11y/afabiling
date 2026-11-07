import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useISP } from '../context/ISPContext';
import { Customer, ODC, ODP } from '../types';
import {
  Navigation,
  MapPin,
  Radio,
  Layers,
  Search,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Compass,
  Zap,
  Info
} from 'lucide-react';

export const GisMap: React.FC = () => {
  const { odcs, odps, customers, toggleCustomerIsolir } = useISP();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [selectedNode, setSelectedNode] = useState<{
    type: 'ODC' | 'ODP' | 'CUSTOMER';
    data: any;
  } | null>(null);

  const [filterType, setFilterType] = useState<'ALL' | 'ODC' | 'ODP' | 'CUSTOMER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Kemayoran, Jakarta Pusat
    const map = L.map(mapContainerRef.current, {
      center: [-6.166, 106.855],
      zoom: 14,
      zoomControl: true
    });

    // Dark CartoDB Tile Layer for modern Telecom GIS look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Topology Lines when data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers except tile layer
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // 1. Draw ODC Markers & Feeder
    odcs.forEach(odc => {
      if (filterType !== 'ALL' && filterType !== 'ODC') return;

      const odcIcon = L.divIcon({
        className: 'custom-odc-icon',
        html: `
          <div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 8px; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(2,132,199,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
            ODC
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([odc.lat, odc.lng], { icon: odcIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedNode({ type: 'ODC', data: odc });
      });
    });

    // 2. Draw ODP Markers & Lines from parent ODC
    odps.forEach(odp => {
      const parentOdc = odcs.find(o => o.id === odp.odcId);

      // Line from ODC to ODP (Distribution Fiber)
      if (parentOdc && (filterType === 'ALL' || filterType === 'ODP')) {
        L.polyline(
          [
            [parentOdc.lat, parentOdc.lng],
            [odp.lat, odp.lng]
          ],
          {
            color: '#0284c7',
            weight: 3,
            dashArray: '5, 6',
            opacity: 0.8
          }
        ).addTo(map);
      }

      if (filterType !== 'ALL' && filterType !== 'ODP') return;

      const isFull = odp.usedPorts >= odp.capacityPorts;
      const odpIcon = L.divIcon({
        className: 'custom-odp-icon',
        html: `
          <div style="background-color: ${isFull ? '#e11d48' : '#0d9488'}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 9px;">
            ${odp.usedPorts}/${odp.capacityPorts}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([odp.lat, odp.lng], { icon: odpIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedNode({ type: 'ODP', data: odp });
      });
    });

    // 3. Draw Customer Drop Cables & Home Markers
    customers.forEach(cust => {
      const parentOdp = odps.find(o => o.id === cust.odpId);

      // Drop cable line from ODP to Customer
      if (parentOdp && (filterType === 'ALL' || filterType === 'CUSTOMER')) {
        const isIso = cust.status === 'ISOLIR';
        L.polyline(
          [
            [parentOdp.lat, parentOdp.lng],
            [cust.lat, cust.lng]
          ],
          {
            color: isIso ? '#e11d48' : '#10b981',
            weight: 2,
            opacity: 0.8
          }
        ).addTo(map);
      }

      if (filterType !== 'ALL' && filterType !== 'CUSTOMER') return;

      const isIso = cust.status === 'ISOLIR';
      const custIcon = L.divIcon({
        className: 'custom-cust-icon',
        html: `
          <div style="background-color: ${isIso ? '#e11d48' : '#10b981'}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 9px;">
            H
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([cust.lat, cust.lng], { icon: custIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedNode({ type: 'CUSTOMER', data: cust });
      });
    });

    // 4. Draw GPS Technician / Live Location Marker if enabled
    if (gpsLocation) {
      const gpsIcon = L.divIcon({
        className: 'custom-gps-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(37,99,235,0.8); z-index: 10;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([gpsLocation.lat, gpsLocation.lng], { icon: gpsIcon }).addTo(map);
      L.circle([gpsLocation.lat, gpsLocation.lng], {
        radius: 35,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
    }
  }, [odcs, odps, customers, filterType, gpsLocation]);

  // Handle Real-time GPS Tracking
  const toggleGpsTracking = () => {
    if (isGpsTracking) {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }
      setIsGpsTracking(false);
      setGpsLocation(null);
    } else {
      setIsGpsTracking(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setGpsLocation(newLoc);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([newLoc.lat, newLoc.lng], 16);
            }
          },
          err => {
            console.warn('Geolocation fallback to ISP field position', err);
            // Simulated live location near Kemayoran ODP for demonstration
            const simLoc = { lat: -6.1612, lng: 106.8492 };
            setGpsLocation(simLoc);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([simLoc.lat, simLoc.lng], 16);
            }
          },
          { enableHighAccuracy: true }
        );

        const watch = navigator.geolocation.watchPosition(
          pos => {
            setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          null,
          { enableHighAccuracy: true }
        );
        setGpsWatchId(watch);
      } else {
        // Fallback simulation
        const simLoc = { lat: -6.1612, lng: 106.8492 };
        setGpsLocation(simLoc);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([simLoc.lat, simLoc.lng], 16);
        }
      }
    }
  };

  // Center on searched entity
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    // Search customers
    const foundCust = customers.find(
      c => c.name.toLowerCase().includes(q) || c.customerNo.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    );
    if (foundCust && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([foundCust.lat, foundCust.lng], 17);
      setSelectedNode({ type: 'CUSTOMER', data: foundCust });
      return;
    }

    // Search ODP
    const foundOdp = odps.find(o => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
    if (foundOdp && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([foundOdp.lat, foundOdp.lng], 17);
      setSelectedNode({ type: 'ODP', data: foundOdp });
      return;
    }

    // Search ODC
    const foundOdc = odcs.find(o => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
    if (foundOdc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([foundOdc.lat, foundOdc.lng], 17);
      setSelectedNode({ type: 'ODC', data: foundOdc });
      return;
    }

    alert('Tidak ditemukan ODC, ODP, atau Pelanggan dengan kata kunci tersebut.');
  };

  return (
    <div className="space-y-6">
      {/* Top Map Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari ODC, ODP (e.g. ODP-KMY), atau Nama/ID Pelanggan..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Cari
          </button>
        </form>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {(['ALL', 'ODC', 'ODP', 'CUSTOMER'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterType === tab
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              {tab === 'ALL'
                ? 'Semua Node'
                : tab === 'ODC'
                ? `ODC (${odcs.length})`
                : tab === 'ODP'
                ? `ODP (${odps.length})`
                : `Pelanggan (${customers.length})`}
            </button>
          ))}
        </div>

        {/* Live GPS Tracker Button */}
        <button
          onClick={toggleGpsTracking}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
            isGpsTracking
              ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Crosshair className={`w-4 h-4 ${isGpsTracking ? 'text-white' : 'text-blue-400'}`} />
          <span>{isGpsTracking ? 'Pelacakan GPS Aktif' : 'Lacak Lokasi Real-Time'}</span>
        </button>
      </div>

      {/* Main Map & Detail Panel */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 min-h-[560px]">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-[580px] z-10" />

        {/* GIS Legend Float */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-xl text-[11px] space-y-2 pointer-events-auto">
          <div className="font-bold text-white uppercase tracking-wider text-[10px]">
            Legenda Topologi Fiber
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3.5 h-3.5 rounded bg-sky-600 border border-white flex items-center justify-center text-[8px] font-bold text-white">ODC</span>
            <span>ODC Cabinet (Feeder 144 Core)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3.5 h-3.5 rounded-full bg-teal-600 border border-white flex items-center justify-center text-[7px] font-bold text-white">8</span>
            <span>ODP Pole Box (Kapasitas Port)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
            <span>Pelanggan Aktif (Lancar)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white" />
            <span>Pelanggan Terisolir (Overdue)</span>
          </div>
          {isGpsTracking && (
            <div className="flex items-center gap-2 text-blue-400 font-semibold pt-1 border-t border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <span>Posisi GPS Teknisi / User</span>
            </div>
          )}
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 max-w-sm w-full z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-5 rounded-3xl shadow-2xl text-xs space-y-3 pointer-events-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {selectedNode.type} NODE
                </span>
                <h4 className="text-sm font-extrabold text-white mt-1">
                  {selectedNode.data.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {selectedNode.type === 'ODC' && (
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kode Kabinet:</span>
                  <span className="font-mono font-bold text-white">{selectedNode.data.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Alamat:</span>
                  <span className="text-slate-200">{selectedNode.data.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kapasitas Core:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {selectedNode.data.usedCores} / {selectedNode.data.capacityCores} Core
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Koordinat:</span>
                  <span className="font-mono text-slate-400">
                    {selectedNode.data.lat.toFixed(4)}, {selectedNode.data.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {selectedNode.type === 'ODP' && (
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kode ODP:</span>
                  <span className="font-mono font-bold text-white">{selectedNode.data.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nomor Tiang PLN:</span>
                  <span className="font-mono text-amber-300">{selectedNode.data.poleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Port Terpakai:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedNode.data.usedPorts} / {selectedNode.data.capacityPorts} Port
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rata-rata Redaman:</span>
                  <span className="font-mono text-white">{selectedNode.data.rxDbmAverage} dBm</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  ODC Terhubung: {odcs.find(o => o.id === selectedNode.data.odcId)?.name || '-'}
                </div>
              </div>
            )}

            {selectedNode.type === 'CUSTOMER' && (
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Pelanggan:</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedNode.data.customerNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No. WhatsApp:</span>
                  <span className="text-white">{selectedNode.data.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Alamat:</span>
                  <span className="text-slate-200">{selectedNode.data.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status MikroTik:</span>
                  <span
                    className={`font-bold ${
                      selectedNode.data.status === 'ISOLIR' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedNode.data.status === 'ISOLIR' ? 'TERISOLIR' : 'AKTIF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Redaman ONT:</span>
                  <span className="font-mono text-white">{selectedNode.data.opticalPowerRx} dBm</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => toggleCustomerIsolir(selectedNode.data.id)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                      selectedNode.data.status === 'ISOLIR'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {selectedNode.data.status === 'ISOLIR' ? 'Buka Isolir' : 'Isolir Manual'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
