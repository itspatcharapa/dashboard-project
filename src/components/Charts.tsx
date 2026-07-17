import React from "react";
import { MapPin, CheckCircle2, Clock, PlayCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { StatusAggregation, LocationAggregation } from "../types";

interface ChartsProps {
  byStatus: StatusAggregation[];
  byLocation: LocationAggregation[];
  currency: "THB" | "USD";
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

export default function Charts({
  byStatus,
  byLocation,
  currency,
  selectedStatus,
  setSelectedStatus,
  selectedLocation,
  setSelectedLocation,
}: ChartsProps) {
  const currencySymbol = currency === "THB" ? "฿" : "$";

  const formatNum = (num: number) => {
    return new Intl.NumberFormat(currency === "THB" ? "th-TH" : "en-US", {
      maximumFractionDigits: 0
    }).format(num);
  };

  // Color mapper for Task Status
  const getStatusConfig = (status: string) => {
    const s = status.trim().toLowerCase();
    if (s === "completed" || s === "เสร็จสิ้น" || s === "เสร็จสิ้นแล้ว") {
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        barColor: "bg-emerald-500",
        color: "#10b981", // emerald-500
        icon: CheckCircle2,
      };
    } else if (s === "in progress" || s === "กำลังดำเนินงาน" || s === "กำลังดำเนินการ") {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        barColor: "bg-amber-500",
        color: "#f59e0b", // amber-500
        icon: Clock,
      };
    } else {
      return {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        barColor: "bg-indigo-500",
        color: "#6366f1", // indigo-500
        icon: PlayCircle,
      };
    }
  };

  const totalTasks = byStatus.reduce((acc, curr) => acc + curr.count, 0);

  // Take top locations for circular gauge grid (max 4 for clean alignment)
  const sortedLocations = [...byLocation].sort((a, b) => b.budget - a.budget);
  const displayLocations = sortedLocations.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      
      {/* LEFT: Task Status Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-800">
              <div className="w-1 h-4 bg-indigo-500 rounded-xs"></div>
              สัดส่วนสถานะงาน (Task Status)
            </h3>
            {selectedStatus && (
              <button
                onClick={() => setSelectedStatus("")}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded transition-all cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          <div className="space-y-5">
            {byStatus.map((item) => {
              const config = getStatusConfig(item.status);
              const percentage = totalTasks > 0 ? (item.count / totalTasks) * 100 : 0;
              const isCurrent = selectedStatus === item.status;

              return (
                <div
                  key={item.status}
                  onClick={() => setSelectedStatus(isCurrent ? "" : item.status)}
                  className={`cursor-pointer transition-all ${
                    isCurrent ? "scale-[1.02]" : selectedStatus ? "opacity-40" : "hover:opacity-90"
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tight text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${config.barColor}`}></span>
                      {item.status}
                    </span>
                    <span className="font-mono">
                      {item.count} งาน ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${config.barColor} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>งบประมาณ {currencySymbol}{formatNum(item.budget)}</span>
                    <span>คืบหน้า {(item.averageProgress * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aggregated Quick Metrics at bottom */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-around items-center text-center">
          <div className="border-r border-slate-200 flex-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ดำเนินการอยู่</p>
            <p className="text-lg font-black font-mono text-slate-800">
              {byStatus.find(s => s.status.toLowerCase().includes("progress") || s.status.includes("กำลัง"))?.count || 0}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">เสร็จสมบูรณ์</p>
            <p className="text-lg font-black font-mono text-indigo-600">
              {byStatus.find(s => s.status.toLowerCase().includes("complete") || s.status.includes("เสร็จ"))?.count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Project Area Performance (Circular SVG Gauges) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-800">
              <div className="w-1 h-4 bg-indigo-500 rounded-xs"></div>
              ความคืบหน้าแต่ละพื้นที่ (Area Progress)
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-xs"></div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">เฉลี่ยของพื้นที่</span>
              {selectedLocation && (
                <button
                  onClick={() => setSelectedLocation("")}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded transition-all cursor-pointer ml-2"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          {/* Area Gauge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            {displayLocations.map((item) => {
              const isCurrent = selectedLocation === item.location;
              const progressFraction = item.averageProgress;
              const progressPercent = Math.round(progressFraction * 100);
              
              // Calculate SVG circular parameters
              // Radius is 36, circumference = 2 * PI * 36 ≈ 226.2
              const r = 36;
              const circumference = 2 * Math.PI * r;
              const strokeDashoffset = circumference * (1 - progressFraction);

              return (
                <div
                  key={item.location}
                  onClick={() => setSelectedLocation(isCurrent ? "" : item.location)}
                  className={`bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center gap-3 border transition-all cursor-pointer ${
                    isCurrent
                      ? "border-indigo-300 bg-indigo-50/20 shadow-xs scale-[1.03]"
                      : selectedLocation
                      ? "opacity-45 border-slate-100"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-100/30"
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center block max-w-full truncate">
                    {item.location}
                  </span>
                  
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r={r}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="7"
                      />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r={r}
                        fill="transparent"
                        stroke="#4f46e5"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-sm font-black font-mono text-slate-800">
                      {progressPercent}%
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] font-bold font-mono text-slate-700">
                      {currencySymbol}{formatNum(item.budget)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
                      {item.count} ชิ้นงาน
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info label */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>เรียงตามขนาดงบประมาณสูงสุด 4 พื้นที่หลัก</span>
          <span>คลิกที่บัตรเพื่อกรองตารางรายชิ้นงาน</span>
        </div>
      </div>

    </div>
  );
}

