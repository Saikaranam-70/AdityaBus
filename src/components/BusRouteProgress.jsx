import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import icon from "../assets/location.png";

export default function BusRouteProgress({ busData }) {
  const [progress, setProgress] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);

  const routePoints = busData?.routePoints || [];
  const busLocation = busData?.currentLocation;

  // 📏 Function to calculate distance between two points (Haversine)
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 📍Calculate bus progress along route
  useEffect(() => {
    if (!routePoints.length || !busLocation) return;

    let totalDist = 0;
    let coveredDist = 0;

    for (let i = 0; i < routePoints.length - 1; i++) {
      totalDist += calcDistance(
        routePoints[i].latitude,
        routePoints[i].longitude,
        routePoints[i + 1].latitude,
        routePoints[i + 1].longitude
      );
    }

    for (let i = 0; i < routePoints.length - 1; i++) {
      const segmentDist = calcDistance(
        routePoints[i].latitude,
        routePoints[i].longitude,
        routePoints[i + 1].latitude,
        routePoints[i + 1].longitude
      );
      const distToSegmentStart = calcDistance(
        routePoints[i].latitude,
        routePoints[i].longitude,
        busLocation.y,
        busLocation.x
      );

      if (distToSegmentStart <= segmentDist) {
        coveredDist += distToSegmentStart;
        break;
      } else {
        coveredDist += segmentDist;
      }
    }

    const progressRatio = coveredDist / totalDist;
    setProgress(Math.min(progressRatio, 1));
    setCurrentDistance(coveredDist.toFixed(2));
  }, [busData]);

  return (
    <div className="bg-white shadow-xl rounded-3xl p-8 mt-8 w-full max-w-4xl mx-auto flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-6 text-center">
        🚍 Route Progress for Bus {busData?.busNumber}
      </h2><br /><br />

      {/* 🛣️ Vertical Route Line */}
      <div className="relative h-96 w-24 flex flex-col items-center justify-between">
        {/* Background route line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gray-300 rounded-full transform -translate-x-1/2"></div>

        {/* Animated progress line */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-2 bg-indigo-600 rounded-full origin-bottom"
          style={{
            transformOrigin: "bottom center",
          }}
          animate={{ scaleY: progress }}
          transition={{ duration: 1, ease: "easeInOut" }}
        ></motion.div>

        {/* Stops */}
        {routePoints.map((stop, index) => (
          <div
            key={index}
            className="flex flex-row items-center text-left z-10"
            style={{
              position: "absolute",
              bottom: `${(index / (routePoints.length - 1)) * 100}%`,
              transform: "translateY(50%)",
            }}
          >
            <div
              className={`w-5 h-5 rounded-full ${
                index === 0
                  ? "bg-green-500"
                  : index === routePoints.length - 1
                  ? "bg-red-500"
                  : "bg-gray-400"
              } border-4 border-white shadow-md`}
            ></div>
            <p className="text-sm ml-3 font-medium text-gray-700">
              {stop.name}
            </p>
          </div>
        ))}

        {/* 🚌 Animated Bus Icon */}
        <motion.div
          className="absolute w-10 h-10 z-20"
          animate={{
            bottom: `${progress * 100}%`,
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <img src={icon} alt="bus" className="w-10 h-10 animate-bounce" />
        </motion.div>
      </div><br /><br />

      {/* 📏 Distance Info */}
      <div className="text-center mt-6 text-gray-700">
        <p>
          <b>Distance Covered:</b> {currentDistance} km
        </p>
        <p>
          <b>Speed:</b> {busData?.currentSpeed || 0} km/h
        </p>
        <p>
          <b>Status:</b> {busData?.currentStatus || "NOT_RUNNING"}
        </p>
      </div>
    </div>
  );
}
