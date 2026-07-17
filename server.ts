import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { SheetRow, DashboardData } from "./src/types";

const app = express();
const PORT = 3000;

// Google Sheet Export URL
const DEFAULT_SHEET_ID = "1Rfsv4rmmPu_rZYlgkjr85fucY2s1CUWDWudG4RPlk7U";
const getExportUrl = (sheetId: string) => `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

// Cache Configuration
let cache: { data: DashboardData; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fallback high-quality mock data matching the exact schema in case Google Sheets is unavailable or offline
const fallbackRows: SheetRow[] = [
  {
    projectId: "P001",
    projectName: "Renovation of a School Project 001",
    projectType: "Renovation",
    location: "Texas",
    startDate: "21/07/2024",
    endDate: "08/08/2024",
    projectStatus: "Behind",
    priority: "Medium",
    taskId: "T001",
    taskName: "Demolition and Clearing",
    taskStatus: "In Progress",
    assignedTo: "Bob",
    hoursSpent: 12,
    budget: 9621,
    actualCost: 2400,
    progress: 0.24
  },
  {
    projectId: "P001",
    projectName: "Renovation of a School Project 001",
    projectType: "Renovation",
    location: "New Jersey",
    startDate: "21/07/2024",
    endDate: "12/08/2024",
    projectStatus: "Behind",
    priority: "High",
    taskId: "T002",
    taskName: "Wall Repair and Plastering",
    taskStatus: "In Progress",
    assignedTo: "Charlie",
    hoursSpent: 4,
    budget: 7814,
    actualCost: 4300,
    progress: 0.56
  },
  {
    projectId: "P001",
    projectName: "Renovation of a School Project 001",
    projectType: "Renovation",
    location: "Ohio",
    startDate: "21/07/2024",
    endDate: "10/08/2024",
    projectStatus: "Behind",
    priority: "High",
    taskId: "T003",
    taskName: "Electrical Fixtures Installation",
    taskStatus: "Completed",
    assignedTo: "Charlie",
    hoursSpent: 5,
    budget: 1028,
    actualCost: 1011,
    progress: 1.0
  },
  {
    projectId: "P002",
    projectName: "Innovation of a Classroom Project 002",
    projectType: "Innovation",
    location: "Pennsylvania",
    startDate: "04/06/2024",
    endDate: "12/07/2025",
    projectStatus: "On Track",
    priority: "High",
    taskId: "T001",
    taskName: "Smartboard Setup",
    taskStatus: "Pending",
    assignedTo: "Charlie",
    hoursSpent: 24,
    budget: 1530,
    actualCost: 0,
    progress: 0.33
  },
  {
    projectId: "P002",
    projectName: "Innovation of a Classroom Project 002",
    projectType: "Innovation",
    location: "New York",
    startDate: "04/06/2024",
    endDate: "26/06/2025",
    projectStatus: "On Track",
    priority: "Medium",
    taskId: "T002",
    taskName: "Acoustic Wall Panels",
    taskStatus: "Pending",
    assignedTo: "Charlie",
    hoursSpent: 26,
    budget: 7201,
    actualCost: 0,
    progress: 0.32
  },
  {
    projectId: "P002",
    projectName: "Innovation of a Classroom Project 002",
    projectType: "Innovation",
    location: "California",
    startDate: "04/06/2024",
    endDate: "25/03/2025",
    projectStatus: "On Track",
    priority: "Low",
    taskId: "T003",
    taskName: "Ergonomic Desk Layouts",
    taskStatus: "In Progress",
    assignedTo: "Alice",
    hoursSpent: 28,
    budget: 9814,
    actualCost: 2800,
    progress: 0.29
  },
  {
    projectId: "P003",
    projectName: "Construction of a Hospital Wing Project 003",
    projectType: "Construction",
    location: "Pennsylvania",
    startDate: "20/07/2024",
    endDate: "22/08/2024",
    projectStatus: "Completed",
    priority: "Low",
    taskId: "T001",
    taskName: "Foundation Concrete Pouring",
    taskStatus: "Completed",
    assignedTo: "Grace",
    hoursSpent: 7,
    budget: 7981,
    actualCost: 7717,
    progress: 1.0
  },
  {
    projectId: "P003",
    projectName: "Construction of a Hospital Wing Project 003",
    projectType: "Construction",
    location: "Virginia",
    startDate: "20/07/2024",
    endDate: "25/09/2024",
    projectStatus: "Completed",
    priority: "Medium",
    taskId: "T002",
    taskName: "HVAC Duct Routing",
    taskStatus: "Completed",
    assignedTo: "Frank",
    hoursSpent: 23,
    budget: 1032,
    actualCost: 637,
    progress: 1.0
  },
  {
    projectId: "P003",
    projectName: "Construction of a Hospital Wing Project 003",
    projectType: "Construction",
    location: "Ohio",
    startDate: "20/07/2024",
    endDate: "22/08/2024",
    projectStatus: "Completed",
    priority: "Medium",
    taskId: "T003",
    taskName: "Medical Gas Pipeline Integration",
    taskStatus: "Completed",
    assignedTo: "Grace",
    hoursSpent: 13,
    budget: 8546,
    actualCost: 8502,
    progress: 1.0
  }
];

// Double-quotes aware CSV parser
function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"'; // escaped double quote
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(cell.trim());
      lines.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim());
    lines.push(row);
  }

  return lines.filter(r => r.length > 0 && r.some(c => c !== ""));
}

// Resilient Fetch with Exponential Backoff
async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        if (retries > 0) {
          console.warn(`[API WARNING] Status ${response.status}. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetry(url, retries - 1, delay * 2);
        }
      }
      throw new Error(`Google Sheet fetch returned HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    if (retries > 0) {
      console.warn(`[API WARNING] Fetch error: ${error}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Data Aggregation Engine
function processRows(rows: SheetRow[]): DashboardData {
  const totalTasks = rows.length;
  
  let totalBudget = 0;
  let totalActualCost = 0;
  let totalHoursSpent = 0;
  let sumProgress = 0;
  let completedTasksCount = 0;
  
  const uniqueProjectIds = new Set<string>();

  // Temporary aggregation stores
  const statusMap: { [status: string]: { count: number; budget: number; actualCost: number; progressSum: number } } = {};
  const locationMap: { [location: string]: { count: number; budget: number; actualCost: number; progressSum: number } } = {};
  const typeMap: { [type: string]: { count: number; budget: number; actualCost: number; progressSum: number } } = {};
  const projectStatusMap: { [status: string]: { count: number; budget: number; actualCost: number; progressSum: number } } = {};

  rows.forEach(row => {
    uniqueProjectIds.add(row.projectId);
    totalBudget += row.budget;
    totalActualCost += row.actualCost;
    totalHoursSpent += row.hoursSpent;
    sumProgress += row.progress;

    if (row.taskStatus.trim().toLowerCase() === "completed") {
      completedTasksCount++;
    }

    // Helper for groupings
    const initGroup = () => ({ count: 0, budget: 0, actualCost: 0, progressSum: 0 });

    // Status Grouping
    const statusKey = row.taskStatus || "Unknown";
    if (!statusMap[statusKey]) statusMap[statusKey] = initGroup();
    statusMap[statusKey].count++;
    statusMap[statusKey].budget += row.budget;
    statusMap[statusKey].actualCost += row.actualCost;
    statusMap[statusKey].progressSum += row.progress;

    // Location Grouping
    const locationKey = row.location || "Unknown";
    if (!locationMap[locationKey]) locationMap[locationKey] = initGroup();
    locationMap[locationKey].count++;
    locationMap[locationKey].budget += row.budget;
    locationMap[locationKey].actualCost += row.actualCost;
    locationMap[locationKey].progressSum += row.progress;

    // Project Type Grouping
    const typeKey = row.projectType || "Unknown";
    if (!typeMap[typeKey]) typeMap[typeKey] = initGroup();
    typeMap[typeKey].count++;
    typeMap[typeKey].budget += row.budget;
    typeMap[typeKey].actualCost += row.actualCost;
    typeMap[typeKey].progressSum += row.progress;

    // Project Status Grouping
    const projStatusKey = row.projectStatus || "Unknown";
    if (!projectStatusMap[projStatusKey]) projectStatusMap[projStatusKey] = initGroup();
    projectStatusMap[projStatusKey].count++;
    projectStatusMap[projStatusKey].budget += row.budget;
    projectStatusMap[projStatusKey].actualCost += row.actualCost;
    projectStatusMap[projStatusKey].progressSum += row.progress;
  });

  const averageProgress = totalTasks > 0 ? (sumProgress / totalTasks) : 0;
  const completedTasksPercentage = totalTasks > 0 ? (completedTasksCount / totalTasks) : 0;

  return {
    rawData: rows,
    summary: {
      totalBudget,
      totalActualCost,
      totalHoursSpent,
      totalProjects: uniqueProjectIds.size,
      totalTasks,
      averageProgress,
      completedTasksCount,
      completedTasksPercentage
    },
    byStatus: Object.keys(statusMap).map(status => ({
      status,
      count: statusMap[status].count,
      budget: statusMap[status].budget,
      actualCost: statusMap[status].actualCost,
      averageProgress: statusMap[status].count > 0 ? (statusMap[status].progressSum / statusMap[status].count) : 0
    })),
    byLocation: Object.keys(locationMap).map(location => ({
      location,
      count: locationMap[location].count,
      budget: locationMap[location].budget,
      actualCost: locationMap[location].actualCost,
      averageProgress: locationMap[location].count > 0 ? (locationMap[location].progressSum / locationMap[location].count) : 0
    })),
    byProjectType: Object.keys(typeMap).map(projectType => ({
      projectType,
      count: typeMap[projectType].count,
      budget: typeMap[projectType].budget,
      actualCost: typeMap[projectType].actualCost,
      averageProgress: typeMap[projectType].count > 0 ? (typeMap[projectType].progressSum / typeMap[projectType].count) : 0
    })),
    byProjectStatus: Object.keys(projectStatusMap).map(projectStatus => ({
      projectStatus,
      count: projectStatusMap[projectStatus].count,
      budget: projectStatusMap[projectStatus].budget,
      actualCost: projectStatusMap[projectStatus].actualCost,
      averageProgress: projectStatusMap[projectStatus].count > 0 ? (projectStatusMap[projectStatus].progressSum / projectStatusMap[projectStatus].count) : 0
    }))
  };
}

// API Routes
app.get("/api/dashboard-data", async (req, res) => {
  const sheetIdQuery = req.query.sheetId as string;
  const activeSheetId = sheetIdQuery || DEFAULT_SHEET_ID;

  // Utilize cache if using default sheet and TTL is active
  if (!sheetIdQuery && cache && (Date.now() - cache.timestamp < CACHE_TTL)) {
    return res.json(cache.data);
  }

  try {
    const url = getExportUrl(activeSheetId);
    console.log(`[SERVER] Fetching data from Google Sheet: ${activeSheetId}`);
    const csvContent = await fetchWithRetry(url, 3, 1000);
    const parsed = parseCSV(csvContent);

    if (parsed.length <= 1) {
      throw new Error("CSV does not contain sufficient rows");
    }

    // Skip Header row and map columns
    const records: SheetRow[] = parsed.slice(1).map((row, index) => {
      // Safely fetch string or default
      const getVal = (colIdx: number, def = "") => row[colIdx] !== undefined ? row[colIdx].trim() : def;
      
      // Parse numeric fields safely
      const parseNum = (colIdx: number) => {
        if (row[colIdx] === undefined) return 0;
        const cleaned = row[colIdx].replace(/[^0-9.-]/g, ""); // strip currency/commas
        const val = parseFloat(cleaned);
        return isNaN(val) ? 0 : val;
      };

      // Progress is usually represented as standard decimals (e.g. 0.24 = 24%)
      let progress = parseNum(15);
      // Safeguard in case they represent progress in range 0-100
      if (progress > 1.0 && progress <= 100) {
        progress = progress / 100;
      }

      return {
        projectId: getVal(0, `P-Unknown-${index}`),
        projectName: getVal(1, "Unnamed Project"),
        projectType: getVal(2, "General"),
        location: getVal(3, "HQ"),
        startDate: getVal(4, "-"),
        endDate: getVal(5, "-"),
        projectStatus: getVal(6, "Unknown"),
        priority: getVal(7, "Normal"),
        taskId: getVal(8, `T-Unknown-${index}`),
        taskName: getVal(9, "Unnamed Task"),
        taskStatus: getVal(10, "Pending"),
        assignedTo: getVal(11, "Unassigned"),
        hoursSpent: parseNum(12),
        budget: parseNum(13),
        actualCost: parseNum(14),
        progress: progress
      };
    });

    const dashboardData = processRows(records);

    // Save default sheet to cache
    if (!sheetIdQuery) {
      cache = {
        data: dashboardData,
        timestamp: Date.now()
      };
    }

    return res.json(dashboardData);
  } catch (error) {
    console.error(`[SERVER ERROR] Failed to fetch or parse sheet ${activeSheetId}:`, error);
    
    // Fallback to high-quality mockup data
    console.warn("[SERVER] Returning resilient fallback project data");
    const fallbackData = processRows(fallbackRows);
    return res.json(fallbackData);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
