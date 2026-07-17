import React, { useState } from "react";
import { RefreshCw, FileSpreadsheet, ExternalLink, Sparkles, CheckCircle, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  sheetId: string;
  setSheetId: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
  currency: "THB" | "USD";
  setCurrency: (curr: "THB" | "USD") => void;
}

export default function Header({
  sheetId,
  setSheetId,
  onRefresh,
  isLoading,
  lastUpdated,
  currency,
  setCurrency,
}: HeaderProps) {
  const [inputValue, setInputValue] = useState(sheetId);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Support full Google Sheets URL pasting
    let extractedId = inputValue.trim();
    if (inputValue.includes("docs.google.com/spreadsheets")) {
      const matches = inputValue.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (matches && matches[1]) {
        extractedId = matches[1];
      }
    }
    setSheetId(extractedId);
    setInputValue(extractedId);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Titles */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center shrink-0 shadow-sm">
              <div className="w-5 h-5 border-2 border-white rotate-45"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight uppercase" id="main-dashboard-title">
                  SheetSync Dashboard
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Sparkles className="h-3 w-3" /> Live Sync
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-0.5" id="dashboard-subtitle">
                Google Sheets Real-Time Analytics Dashboard
              </p>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Currency Toggle */}
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
              <button
                onClick={() => setCurrency("THB")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  currency === "THB"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                ฿ THB
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  currency === "USD"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Google Sheets ID Controller */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-sm w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="วางลิงก์หรือ ID ของ Google Sheet..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full md:w-64 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-700 px-3 py-2 pr-7 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-[11px] rounded-lg shadow-xl z-50 leading-relaxed">
                    คุณสามารถวาง URL ของ Google Sheet เต็มรูปแบบ หรือเฉพาะ Sheet ID เพื่อเปลี่ยนเป็นข้อมูลของคุณเอง (ต้องตั้งค่าให้แชร์แบบสาธารณะ "ทุกคนที่มีลิงก์มีสิทธิ์อ่าน")
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 active:scale-98 text-white px-3 py-2 text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                อัปเดต
              </button>
            </form>

            {/* Refresh Button */}
            <motion.button
              onClick={onRefresh}
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 shadow-sm cursor-pointer disabled:opacity-50"
              title="ดึงข้อมูลล่าสุด"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
            </motion.button>

            {/* View Source Google Sheet Link */}
            <a
              href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">เปิด Google Sheet</span>
            </a>

          </div>
        </div>

        {/* Sync Status bar */}
        {lastUpdated && (
          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400 font-mono">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>เชื่อมต่อกับชีตสำเร็จ • อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}</span>
          </div>
        )}
      </div>
    </header>
  );
}
