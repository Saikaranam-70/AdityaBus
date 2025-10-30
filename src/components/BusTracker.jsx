import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import icon from "../assets/bus.png";
import BusRouteProgress from "./BusRouteProgress";

// 🚌 Custom Bus Icon
const busIcon = new L.Icon({
  iconUrl: icon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function BusTracker() {
  const [busNumber, setBusNumber] = useState("");
  const [allBuses, setAllBuses] = useState([]);
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🚀 Fetch all buses initially
  const fetchAllBuses = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/student/buses");
      if (!response.ok) throw new Error("Failed to fetch buses");
      const data = await response.json();
      setAllBuses(data);
    } catch (error) {
      console.error("Error fetching all buses:", error);
      toast.error("Error loading buses");
    }
  };

  useEffect(() => {
    fetchAllBuses();
  }, []);

  // 🚀 Fetch specific bus by number
  const fetchBusData = async (number = busNumber) => {
    if (!number.trim()) {
      toast.warn("Please enter a bus number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/student/buses/${number}`
      );
      if (!response.ok) throw new Error("Bus not found or server error");
      const data = await response.json();
      setBusData(data);

      if (!data.currentLocation) {
        toast.info("Bus location not updated yet");
      } else {
        toast.success(`Tracking Bus ${data.busNumber}`);
      }
    } catch (error) {
      console.error("Error fetching bus:", error);
      toast.error("Bus not found or server error");
      setBusData(null);
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ Trigger search with Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") fetchBusData();
  };

  // 🔁 Auto-refresh every 10s for specific bus
  useEffect(() => {
    if (!busData || !busData.id) return;
    const interval = setInterval(() => {
      fetchBusData(busData.busNumber);
    }, 10000);
    return () => clearInterval(interval);
  }, [busData]);

  // 🗺️ Default Map center
  const defaultCenter = busData?.currentLocation
    ? [busData.currentLocation.y, busData.currentLocation.x]
    : allBuses[0]?.currentLocation
    ? [allBuses[0].currentLocation.y, allBuses[0].currentLocation.x]
    : [17.0, 82.0]; // fallback

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 flex flex-col items-center py-10 px-4">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6 text-indigo-800 tracking-wide"
      >
        🚌 Real-Time Bus Tracker
      </motion.h1>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex w-full max-w-lg bg-white shadow-lg rounded-2xl overflow-hidden"
      >
        <input
          type="text"
          placeholder="Enter Bus Number (e.g., 222)"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-grow p-3 text-lg outline-none"
        />
        <button
          onClick={() => fetchBusData(busNumber)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-semibold transition-all"
        >
          {loading ? "Tracking..." : "Track"}
        </button>
      </motion.div>

      {/* 🗺️ Map Section */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl mt-8 rounded-3xl overflow-hidden shadow-2xl"
      >
        <MapContainer
          center={defaultCenter}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {/* Show all buses before search */}
          {!busData &&
            allBuses.map((bus) => {
              const lat = bus.currentLocation?.y;
              const lng = bus.currentLocation?.x;
              if (!lat || !lng) return null;
              return (
                <Marker key={bus.id} position={[lat, lng]} icon={busIcon}>
                  <Popup>
                    <b>Bus:</b> {bus.busNumber} <br />
                    <b>Driver:</b> {bus.driverName || "N/A"} <br />
                    <b>Route:</b> {bus.routeName || "Unknown"} <br />
                    <b>Status:</b> {bus.currentStatus || "Unknown"} <br />
                    <b>Speed:</b> {bus.currentSpeed || 0} km/h <br />
                    <a
                      href={`https://www.google.com/maps?q=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open in Google Maps
                    </a>
                  </Popup>
                </Marker>
              );
            })}

          {/* Selected bus with route (updated) */}
          {busData && (
            <>
              {/* Polyline: show route as a continuous line */}
              
              {busData.routePoints?.length > 1 && (
                <Polyline
                  positions={busData.routePoints.map((p) => [
                    p.latitude,
                    p.longitude,
                  ])}
                  pathOptions={{ color: "blue", weight: 5, opacity: 0.85 }}
                />
              )}

              {/* Route stops: show markers along the line */}
              {busData.routePoints?.map((point, idx) => (
                <Marker
                  key={idx}
                  position={[point.latitude, point.longitude]}
                  icon={
                    new L.Icon({
                      iconUrl:
                        "https://cdn-icons-png.flaticon.com/512/854/854894.png",
                      iconSize: [30, 30],
                    })
                  }
                >
                  <Popup>
                    <b>Stop {idx + 1}: {point.name}</b>
                    <br />
                    {point.address}
                  </Popup>
                </Marker>
              ))}
              
              {/* Bus Marker: Show current location on the line */}
              {busData.currentLocation?.y != null && busData.currentLocation?.x != null && (
                <Marker
                  position={[
                    busData.currentLocation.y,
                    busData.currentLocation.x,
                  ]}
                  icon={busIcon}
                >
                  <Popup>
                    <b>Bus:</b> {busData.busNumber} <br />
                    <b>Driver:</b> {busData.driverName || "N/A"} <br />
                    <b>Speed:</b> {busData.currentSpeed || 0} km/h <br />
                    <b>Status:</b> {busData.currentStatus || "Unknown"} <br />
                    <a
                      href={`https://www.google.com/maps?q=${busData.currentLocation?.y},${busData.currentLocation?.x}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open in Google Maps
                    </a>
                  </Popup>
                </Marker>
              )}
            </>
          )}
        </MapContainer>
      </motion.div>

      

      {/* 🧾 Bus List Section */}
      {!busData && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl"
        >
          {allBuses.map((bus) => (
            <motion.div
              key={bus.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-md rounded-2xl p-5 text-center border border-indigo-100 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold text-indigo-700">
                Bus {bus.busNumber}
              </h3>
              <p className="text-gray-600">
                Route: {bus.routeName || "Unknown"}
              </p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    bus.currentStatus === "RUNNING"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {bus.currentStatus}
                </span>
              </p>
              <p>Speed: {bus.currentSpeed || 0} km/h</p>
              <button
                onClick={() => {
                  setBusNumber(bus.busNumber);
                  fetchBusData(bus.busNumber);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition"
              >
                Track
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Selected Bus Info */}
      {busData && (
        <>
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white mt-8 p-6 rounded-3xl shadow-lg w-full max-w-lg text-center"
        >
            
          <h2 className="text-xl font-semibold text-indigo-700 mb-3">
            🚌 Bus Details
          </h2>
          <p>
            <b>Bus Number:</b> {busData.busNumber}
          </p>
          <p>
            <b>Driver Name:</b> {busData.driverName || "Not Assigned"}
          </p>
          <p>
            <b>Route:</b> {busData.routeName || "Unknown"}
          </p>
          <p>
            <b>Speed:</b> {busData.currentSpeed || 0} km/h
          </p>
          <p>
            <b>Status:</b> {busData.currentStatus || "NOT_RUNNING"}
          </p>
          <p>
            <b>Last Updated:</b> {busData.lastUpdated || "Not Available"}
          </p>
          <button
            onClick={() => setBusData(null)}
            className="mt-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            Back to All Buses
          </button>
        </motion.div>
        <BusRouteProgress busData={busData} />
        </>
      )}
      
    </div>
  );
}
