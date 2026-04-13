"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

import { useTheme } from "next-themes";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  pins?: Array<{ lat: number; lng: number }>;
  lineColor?: string;
  showLines?: boolean;
}

export function WorldMap({
  dots = [],
  pins = [],
  lineColor = "#0ea5e9",
  showLines = true,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const { theme } = useTheme();

  const svgMap = map.getSVG({
    radius: 0.22,
    color: theme === "dark" ? "#FFFFFF40" : "#00000040",
    shape: "circle",
    backgroundColor: theme === "dark" ? "black" : "white",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg  relative font-sans">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Connection lines (optional) */}
        {showLines &&
          dots.map((dot, i) => {
            const startPoint = projectPoint(dot.start.lat, dot.start.lng);
            const endPoint = projectPoint(dot.end.lat, dot.end.lng);
            return (
              <g key={`path-group-${i}`}>
                <motion.path
                  d={createCurvedPath(startPoint, endPoint)}
                  fill="none"
                  stroke="url(#path-gradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 * i, ease: "easeOut" }}
                />
              </g>
            );
          })}

        {/* Dot endpoint markers (from dots prop) */}
        {dots.map((dot, i) => {
          const points = [
            projectPoint(dot.start.lat, dot.start.lng),
            projectPoint(dot.end.lat, dot.end.lng),
          ];
          return (
            <g key={`points-group-${i}`}>
              {points.map((pt, j) => (
                <g key={`dot-${i}-${j}`}>
                  <circle cx={pt.x} cy={pt.y} r="2" fill={lineColor} />
                  <circle cx={pt.x} cy={pt.y} r="2" fill={lineColor} opacity="0.5">
                    <animate attributeName="r" from="2" to="8" dur="1.5s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
            </g>
          );
        })}

        {/* Standalone pin markers (from pins prop) */}
        {pins.map((pin, i) => {
          const pt = projectPoint(pin.lat, pin.lng);
          return (
            <motion.g
              key={`pin-${i}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 * i, ease: "easeOut" }}
            >
              {/* ping circle */}
              <circle cx={pt.x} cy={pt.y} r="2" fill={lineColor} opacity="0.4">
                <animate attributeName="r" from="2" to="10" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              {/* location pin icon — shifted so bottom tip is at the point */}
              <g transform={`translate(${pt.x - 5}, ${pt.y - 14}) scale(0.42)`}>
                <path
                  d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9zm0 12.75c-2.07 0-3.75-1.68-3.75-3.75S9.93 5.25 12 5.25 15.75 6.93 15.75 9 14.07 12.75 12 12.75z"
                  fill={lineColor}
                />
              </g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
