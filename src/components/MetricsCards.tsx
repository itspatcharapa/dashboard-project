import { Coins, PiggyBank, Target, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { DashboardSummary } from "../types";

interface MetricsCardsProps {
  summary: DashboardSummary;
  currency: "THB" | "USD";
}

export default function MetricsCards({ summary, currency }: MetricsCardsProps) {
  const currencySymbol = currency === "THB" ? "฿" : "$";
  
  // Format numbers with commas
  const formatNum = (num: number) => {
    return new Intl.NumberFormat(currency === "THB" ? "th-TH" : "en-US", {
      maximumFractionDigits: 0
    }).format(num);
  };

  const budgetUsagePercent = summary.totalBudget > 0 
    ? (summary.totalActualCost / summary.totalBudget) * 100 
    : 0;

  const isOverBudget = summary.totalActualCost > summary.totalBudget;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.4, ease: "easeOut" }
    })
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      
      {/* 1. งบประมาณทั้งหมด (Total Budget) */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
      >
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter block mb-3">
          งบประมาณทั้งหมด (Total Budget)
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-indigo-600 font-mono tracking-tight">
            {currencySymbol}{formatNum(summary.totalBudget)}
          </span>
          <span className="text-xs text-emerald-500 font-bold font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
            +8.2%
          </span>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          <span>สำหรับ {summary.totalProjects} โครงการหลัก</span>
          <span className="font-mono">ID: ALL-P</span>
        </div>
      </motion.div>

      {/* 2. ค่าใช้จ่ายจริง (Actual Cost) */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
      >
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter block mb-3">
          ค่าใช้จ่ายจริง (Actual Cost)
        </span>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black font-mono tracking-tight ${isOverBudget ? "text-rose-600" : "text-slate-800"}`}>
            {currencySymbol}{formatNum(summary.totalActualCost)}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isOverBudget ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-500"}`}>
            {budgetUsagePercent.toFixed(0)}%
          </span>
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-rose-500" : "bg-indigo-500"}`} 
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* 3. ความคืบหน้าโครงการเฉลี่ย (Overall Progress) */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
      >
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter block mb-3">
          ความคืบหน้าภาพรวม (Overall Progress)
        </span>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-slate-800 font-mono tracking-tight">
            {(summary.averageProgress * 100).toFixed(0)}%
          </span>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${summary.averageProgress * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          <span>ความก้าวหน้ารายชิ้นงาน</span>
          <span className="font-mono text-indigo-600">AVG</span>
        </div>
      </motion.div>

      {/* 4. งานแล้วเสร็จ (Tasks Completed) */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-indigo-600 rounded-xl p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 text-white"
      >
        <span className="text-xs font-bold text-indigo-200 uppercase tracking-tighter block mb-3">
          งานเสร็จสิ้น / โครงการที่กำลังดำเนินการ (Tasks & Sites)
        </span>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-3xl font-black italic font-mono tracking-tight">
              {summary.completedTasksCount}
            </span>
            <span className="text-xs text-indigo-200 font-bold ml-1.5 uppercase">
              / {summary.totalTasks} งานรวม
            </span>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-400 border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              P
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-300 border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              O
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold text-indigo-800 uppercase">
              {summary.totalProjects}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-indigo-500/50 flex items-center justify-between text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">
          <span>ความคืบหน้าสะสม</span>
          <span className="font-mono text-emerald-300">
            {(summary.completedTasksPercentage * 100).toFixed(0)}% Done
          </span>
        </div>
      </motion.div>

    </div>
  );
}
