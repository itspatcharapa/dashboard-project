export interface SheetRow {
  projectId: string;
  projectName: string;
  projectType: string;
  location: string;
  startDate: string;
  endDate: string;
  projectStatus: string;
  priority: string;
  taskId: string;
  taskName: string;
  taskStatus: string;
  assignedTo: string;
  hoursSpent: number;
  budget: number;
  actualCost: number;
  progress: number;
}

export interface DashboardSummary {
  totalBudget: number;
  totalActualCost: number;
  totalHoursSpent: number;
  totalProjects: number;
  totalTasks: number;
  averageProgress: number;
  completedTasksCount: number;
  completedTasksPercentage: number;
}

export interface StatusAggregation {
  status: string;
  count: number;
  budget: number;
  actualCost: number;
  averageProgress: number;
}

export interface LocationAggregation {
  location: string;
  count: number;
  budget: number;
  actualCost: number;
  averageProgress: number;
}

export interface ProjectTypeAggregation {
  projectType: string;
  count: number;
  budget: number;
  actualCost: number;
  averageProgress: number;
}

export interface ProjectStatusAggregation {
  projectStatus: string;
  count: number;
  budget: number;
  actualCost: number;
  averageProgress: number;
}

export interface DashboardData {
  rawData: SheetRow[];
  summary: DashboardSummary;
  byStatus: StatusAggregation[];
  byLocation: LocationAggregation[];
  byProjectType: ProjectTypeAggregation[];
  byProjectStatus: ProjectStatusAggregation[];
}
