import { useState, useMemo } from "react";
import { Search, Filter, X, Calendar, Building2 } from "lucide-react";

interface SearchFilters {
  searchTerm: string;
  department: string;
  severity: string;
  dateRange: "all" | "week" | "month" | "3months" | "year";
  showLifeThreatening: boolean;
}

interface PrescriptionSearchProps {
  prescriptions: any[];
  onFilteredResults: (filtered: any[]) => void;
}

export function PrescriptionSearch({
  prescriptions,
  onFilteredResults,
}: PrescriptionSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    department: "all",
    severity: "all",
    dateRange: "all",
    showLifeThreatening: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(prescriptions.map((p) => p.department));
    return Array.from(depts).sort();
  }, [prescriptions]);

  // Apply filters
  useMemo(() => {
    let filtered = [...prescriptions];

    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.medicationName.toLowerCase().includes(term) ||
          p.department.toLowerCase().includes(term) ||
          p.prescribedBy.toLowerCase().includes(term) ||
          p.hospital.toLowerCase().includes(term) ||
          (p.diagnosis && p.diagnosis.toLowerCase().includes(term))
      );
    }

    // Department filter
    if (filters.department !== "all") {
      filtered = filtered.filter((p) => p.department === filters.department);
    }

    // Severity filter
    if (filters.severity !== "all") {
      filtered = filtered.filter((p) => p.severity === filters.severity);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((p) => {
        const prescDate = new Date(p.prescriptionDate || p.uploadDate);
        return prescDate >= cutoffDate;
      });
    }

    // Life-threatening filter
    if (filters.showLifeThreatening) {
      filtered = filtered.filter((p) => p.lifeThreatening);
    }

    onFilteredResults(filtered);
  }, [filters, prescriptions, onFilteredResults]);

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      department: "all",
      severity: "all",
      dateRange: "all",
      showLifeThreatening: false,
    });
  };

  const activeFiltersCount =
    (filters.department !== "all" ? 1 : 0) +
    (filters.severity !== "all" ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.showLifeThreatening ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search medications, doctors, hospitals, or diagnoses..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.searchTerm && (
            <button
              onClick={() => setFilters({ ...filters, searchTerm: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
            showFilters || activeFiltersCount > 0
              ? "bg-blue-50 border-blue-500 text-blue-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filter Options</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: e.target.value as SearchFilters["dateRange"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Life-Threatening Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Critical Only
              </label>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={filters.showLifeThreatening}
                  onChange={(e) =>
                    setFilters({ ...filters, showLifeThreatening: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Life-threatening only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.department !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Department: {filters.department}
              <button
                onClick={() => setFilters({ ...filters, department: "all" })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.severity !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Severity: {filters.severity}
              <button
                onClick={() => setFilters({ ...filters, severity: "all" })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateRange !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Date: {filters.dateRange}
              <button
                onClick={() => setFilters({ ...filters, dateRange: "all" })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.showLifeThreatening && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              Critical conditions
              <button
                onClick={() => setFilters({ ...filters, showLifeThreatening: false })}
                className="hover:bg-red-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
