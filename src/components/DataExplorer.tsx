import { useState, useMemo } from "react";
import { 
  Search, SlidersHorizontal, ArrowUpDown, User, Calendar, 
  MapPin, AlertTriangle, CheckCircle2, Clock, PlayCircle, 
  FileDown, ChevronLeft, ChevronRight, X 
} from "lucide-react";
import { SheetRow } from "../types";

interface DataExplorerProps {
  rawData: SheetRow[];
  currency: "THB" | "USD";
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

type SortField = "budget" | "actualCost" | "progress" | "endDate" | "projectName";
type SortOrder = "asc" | "desc";

export default function DataExplorer({
  rawData,
  currency,
  selectedStatus,
  setSelectedStatus,
  selectedLocation,
  setSelectedLocation,
}: DataExplorerProps) {
  const currencySymbol = currency === "THB" ? "฿" : "$";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  // Sorting States
  const [sortField, setSortField] = useState<SortField>("projectName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dynamic dropdown values parsed from sheet data
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(rawData.map((r) => r.location).filter(Boolean))).sort();
  }, [rawData]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(rawData.map((r) => r.projectType).filter(Boolean))).sort();
  }, [rawData]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(rawData.map((r) => r.taskStatus).filter(Boolean))).sort();
  }, [rawData]);

  const uniquePriorities = useMemo(() => {
    return Array.from(new Set(rawData.map((r) => r.priority).filter(Boolean))).sort();
  }, [rawData]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc for easier analytics
    }
    setCurrentPage(1);
  };

  // 1. Filtering Logic
  const filteredData = useMemo(() => {
    return rawData.filter((row) => {
      // Search matches Project Name, Task Name, Assigned To, or ID
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        row.projectName.toLowerCase().includes(query) ||
        row.taskName.toLowerCase().includes(query) ||
        row.assignedTo.toLowerCase().includes(query) ||
        row.projectId.toLowerCase().includes(query) ||
        row.taskId.toLowerCase().includes(query);

      const matchStatus = !selectedStatus || row.taskStatus === selectedStatus;
      const matchLocation = !selectedLocation || row.location === selectedLocation;
      const matchType = !selectedType || row.projectType === selectedType;
      const matchPriority = !selectedPriority || row.priority === selectedPriority;

      return matchSearch && matchStatus && matchLocation && matchType && matchPriority;
    });
  }, [rawData, searchQuery, selectedStatus, selectedLocation, selectedType, selectedPriority]);

  // 2. Sorting Logic
  const sortedData = useMemo(() => {
    const dataCopy = [...filteredData];
    return dataCopy.sort((a, b) => {
      let comparison = 0;

      if (sortField === "budget") {
        comparison = a.budget - b.budget;
      } else if (sortField === "actualCost") {
        comparison = a.actualCost - b.actualCost;
      } else if (sortField === "progress") {
        comparison = a.progress - b.progress;
      } else if (sortField === "projectName") {
        comparison = a.projectName.localeCompare(b.projectName);
      } else if (sortField === "endDate") {
        // Simple date comparison (DD/MM/YYYY support)
        const parseDate = (dStr: string) => {
          const parts = dStr.split("/");
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
          }
          return 0;
        };
        comparison = parseDate(a.endDate) - parseDate(b.endDate);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortOrder]);

  // 3. Pagination Logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  // Format currencies helper
  const formatNum = (num: number) => {
    return new Intl.NumberFormat(currency === "THB" ? "th-TH" : "en-US", {
      maximumFractionDigits: 0
    }).format(num);
  };

  // Status Badge color classes
  const getStatusBadge = (status: string) => {
    const s = status.trim().toLowerCase();
    if (s === "completed" || s === "เสร็จสิ้น") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    } else if (s === "in progress" || s === "กำลังดำเนินงาน") {
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    } else if (s === "pending" || s === "รอดำเนินการ") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  // Priority Badge color classes
  const getPriorityBadge = (priority: string) => {
    const p = priority.trim().toLowerCase();
    if (p === "high" || p === "ด่วนที่สุด") {
      return "bg-rose-50 text-rose-700 border-rose-100";
    } else if (p === "medium" || p === "ปานกลาง") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  // Export visible table rows to CSV format
  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    
    // Headers list matching the columns
    const headers = ["Project ID", "Project Name", "Project Type", "Location", "Task Name", "Assigned To", "Budget", "Actual Cost", "Progress", "Task Status", "Priority", "End Date"];
    const csvRows = [headers.join(",")];

    sortedData.forEach(row => {
      const values = [
        `"${row.projectId}"`,
        `"${row.projectName.replace(/"/g, '""')}"`,
        `"${row.projectType}"`,
        `"${row.location}"`,
        `"${row.taskName.replace(/"/g, '""')}"`,
        `"${row.assignedTo}"`,
        row.budget,
        row.actualCost,
        row.progress,
        `"${row.taskStatus}"`,
        `"${row.priority}"`,
        `"${row.endDate}"`
      ];
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `project_dashboard_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if any filters are active to show clear button
  const hasActiveFilters = searchQuery || selectedStatus || selectedLocation || selectedType || selectedPriority;

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedLocation("");
    setSelectedType("");
    setSelectedPriority("");
    setCurrentPage(1);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
      
      {/* 1. Header & Quick Search Panel */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-800">
                <div className="w-1 h-4 bg-indigo-500 rounded-xs"></div>
                สำรวจข้อมูลงานและโครงสร้างงบประมาณ (Project Task Explorer)
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider font-sans">
                Real-Time Query, Filtering & Interactive Data Sheet
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={sortedData.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded transition-all cursor-pointer disabled:opacity-40"
              >
                <FileDown className="h-3.5 w-3.5" />
                ส่งออก CSV ({sortedData.length})
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded transition-all cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          {/* Search Inputs & Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            
            {/* Search Input (spans 4 col) */}
            <div className="relative lg:col-span-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาโครงการ ชื่องาน ผู้รับผิดชอบ หรือรหัส..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Location Select (spans 2 col) */}
            <div className="lg:col-span-2">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer text-slate-600"
              >
                <option value="">ทุกพื้นที่โครงการ</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Select (spans 2 col) */}
            <div className="lg:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer text-slate-600"
              >
                <option value="">ทุกประเภท (Type)</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    🛠️ {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select (spans 2 col) */}
            <div className="lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer text-slate-600"
              >
                <option value="">ทุกสถานะงาน</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    📝 {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select (spans 2 col) */}
            <div className="lg:col-span-2">
              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer text-slate-600"
              >
                <option value="">ทุกความเร่งด่วน</option>
                {uniquePriorities.map((p) => (
                  <option key={p} value={p}>
                    ⚡ {p}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="py-3 px-5">รหัสโครงการ / ชื่อโครงการ (Project ID & Name)</th>
              <th className="py-3 px-4 hidden md:table-cell">ประเภท (Type)</th>
              <th className="py-3 px-4">พื้นที่ (Location)</th>
              <th className="py-3 px-4">ชื่องาน & ผู้รับผิดชอบ (Task Name / Assigned To)</th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort("budget")}>
                <div className="flex items-center gap-1">
                  งบประมาณ
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-all hidden sm:table-cell" onClick={() => handleSort("actualCost")}>
                <div className="flex items-center gap-1">
                  จ่ายจริง
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-all" onClick={() => handleSort("progress")}>
                <div className="flex items-center gap-1">
                  คืบหน้า
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">สถานะ (Status)</th>
              <th className="py-3 px-4 text-center">ด่วน</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="max-w-md mx-auto flex flex-col items-center gap-2">
                    <SlidersHorizontal className="h-8 w-8 text-slate-300" />
                    <span className="font-semibold text-slate-600 text-sm">ไม่พบข้อมูลที่ตรงตามข้อกำหนด</span>
                    <span className="text-xs">กรุณาลองป้อนข้อคำค้นใหม่หรือคลิกเคลียร์ฟิลเตอร์เพื่อเรียกคืนโครงการ</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isOver = row.actualCost > row.budget;
                return (
                  <tr key={`${row.projectId}-${row.taskId}`} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* ID & Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-start gap-1.5 max-w-xs">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                          {row.projectId}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 line-clamp-2 leading-tight">
                            {row.projectName}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                            Task ID: {row.taskId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Project Type */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="text-slate-500 font-medium">
                        {row.projectType}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span>{row.location}</span>
                      </div>
                    </td>

                    {/* Task Name & Assigned Staff */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-slate-700 line-clamp-1 block">
                          {row.taskName}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <User className="h-2.5 w-2.5" />
                          <span>ผู้รับผิดชอบ: <span className="font-semibold text-slate-500">{row.assignedTo}</span></span>
                        </div>
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {currencySymbol}{formatNum(row.budget)}
                    </td>

                    {/* Actual Cost */}
                    <td className="py-4 px-4 font-mono hidden sm:table-cell">
                      <span className={isOver ? "text-rose-600 font-bold" : "text-slate-600"}>
                        {currencySymbol}{formatNum(row.actualCost)}
                      </span>
                      {isOver && (
                        <span className="inline-flex items-center gap-0.5 ml-1 text-[9px] text-rose-500 font-sans" title="ใช้เกินงบประมาณที่กำหนด">
                          <AlertTriangle className="h-2.5 w-2.5" /> Over
                        </span>
                      )}
                    </td>

                    {/* Progress with micro bar */}
                    <td className="py-4 px-4">
                      <div className="max-w-[80px]">
                        <span className="text-[11px] font-bold font-mono text-slate-800 block mb-1">
                          {(row.progress * 100).toFixed(0)}%
                        </span>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              row.progress === 1 ? "bg-emerald-500" : "bg-indigo-500"
                            }`}
                            style={{ width: `${row.progress * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(row.taskStatus)}`}>
                        {row.taskStatus}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${getPriorityBadge(row.priority)}`}>
                        {row.priority}
                      </span>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* 3. Pagination Controls Footer */}
      {sortedData.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          
          <div className="flex items-center gap-4">
            <span>
              แสดงข้อมูล <strong>{Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)}</strong> ถึง{" "}
              <strong>{Math.min(sortedData.length, currentPage * pageSize)}</strong> จากทั้งหมด{" "}
              <strong>{sortedData.length}</strong> รายการ
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span>แสดง:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none text-slate-600 focus:border-indigo-500"
              >
                <option value={5}>5 แถว</option>
                <option value={10}>10 แถว</option>
                <option value={20}>20 แถว</option>
                <option value={50}>50 แถว</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1 px-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => {
                  const showDots = i > 0 && p - arr[i - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-1">
                      {showDots && <span className="text-slate-400 font-mono">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`min-w-7 h-7 font-mono font-bold rounded-md text-xs transition-all ${
                          currentPage === p
                            ? "bg-slate-800 text-white shadow-xs"
                            : "bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
