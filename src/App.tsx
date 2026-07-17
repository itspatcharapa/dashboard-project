import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, FileSpreadsheet, HardDriveDownload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardData } from "./types";
import Header from "./components/Header";
import MetricsCards from "./components/MetricsCards";
import Charts from "./components/Charts";
import DataExplorer from "./components/DataExplorer";

const INITIAL_SHEET_ID = "1Rfsv4rmmPu_rZYlgkjr85fucY2s1CUWDWudG4RPlk7U";

export default function App() {
  const [sheetId, setSheetId] = useState(INITIAL_SHEET_ID);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currency, setCurrency] = useState<"THB" | "USD">("THB");

  // Selection states synced across Charts and Table Filters
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const fetchDashboardData = async (forceSheetId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeId = forceSheetId || sheetId;
      const response = await fetch(`/api/dashboard-data?sheetId=${activeId}`);
      if (!response.ok) {
        throw new Error(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลักได้ (HTTP ${response.status})`);
      }
      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("[APP] Fetch dashboard error:", err);
      setError(
        err.message || 
        "เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheets กรุณาตรวจสอบลิงก์ของท่าน หรือตั้งค่าชีตให้อนุญาตการเข้าถึงเป็นสาธารณะ"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and sheetId changes
  useEffect(() => {
    fetchDashboardData();
  }, [sheetId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      
      {/* 1. Header Component */}
      <Header
        sheetId={sheetId}
        setSheetId={(id) => {
          setSheetId(id);
          setSelectedStatus("");
          setSelectedLocation("");
        }}
        onRefresh={() => fetchDashboardData()}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* 2. Main Body stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            
            /* Loading State Animation */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded flex items-center justify-center animate-spin shadow-md">
                  <div className="w-8 h-8 border-2 border-white rotate-45"></div>
                </div>
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 animate-pulse">กำลังประมวลผลข้อมูลชีต...</h2>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1.5 uppercase tracking-wide font-semibold">
                Google Sheets Real-Time Analytics Pipeline Active
              </p>
            </motion.div>

          ) : error ? (
            
            /* Error Boundary State */
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto my-12 bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center"
            >
              <div className="p-4 bg-rose-50 text-rose-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5 border border-rose-100">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">ไม่สามารถนำเข้าข้อมูลจาก Google Sheets ได้</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {error}
              </p>
              
              <div className="bg-slate-50 rounded-lg p-4 my-6 text-[11px] text-left text-slate-500 space-y-1.5 leading-relaxed border border-slate-200">
                <p className="font-bold text-slate-700 uppercase tracking-wider">📌 วิธีแก้ไขเบื้องต้น (Troubleshooting):</p>
                <p>1. ตรวจสอบให้มั่นใจว่าตั้งค่าชีตเป็นแบบสาธารณะ: <span className="font-semibold">ทุกคนที่มีลิงก์มีสิทธิ์อ่าน</span> (Anyone with the link can view)</p>
                <p>2. ตรวจสอบว่าอินเตอร์เน็ตเชื่อมต่อเสถียร หรือลองกดปุ่มด้านล่างเพื่อสลับกลับมาใช้ <span className="font-semibold">ข้อมูลตัวอย่าง (Fallback Mode)</span></p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setSheetId(INITIAL_SHEET_ID)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 rounded transition-all cursor-pointer"
                >
                  ใช้ไฟล์เริ่มต้น
                </button>
                <button
                  onClick={() => fetchDashboardData()}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-900 rounded transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> ลองอีกครั้ง
                </button>
              </div>
            </motion.div>

          ) : data ? (
            
            /* Beautiful Dashboard Layout */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              
              {/* 3. Metrics Cards Section */}
              <MetricsCards summary={data.summary} currency={currency} />

              {/* 4. Charts Breakdown Section */}
              <Charts
                byStatus={data.byStatus}
                byLocation={data.byLocation}
                currency={currency}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
              />

              {/* 5. Dynamic Data Explorer Section */}
              <DataExplorer
                rawData={data.rawData}
                currency={currency}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
              />

            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* 6. Footer section */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-[9px] text-slate-400 font-sans font-semibold uppercase tracking-widest leading-relaxed">
        <p>© 2026 Google Sheet Project Dashboard. Powered by React, Express, and Vite.</p>
        <p className="mt-1 text-slate-400">
          ระบบสถาปัตยกรรมแบบ Full-stack เชื่อมต่อแบบ Direct API • มีการแคชข้อมูล 5 นาทีเพื่อเสถียรภาพสูงสุด
        </p>
      </footer>

    </div>
  );
}
