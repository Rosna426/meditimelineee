import { Calendar, Pill, Stethoscope, FlaskConical, LayoutGrid } from "lucide-react";
import { EventType } from "../types";

interface FilterBarProps {
  selectedFilter: EventType | "all";
  onFilterChange: (filter: EventType | "all") => void;
}

const filters = [
  { id: "all" as const, label: "All Events", icon: LayoutGrid, color: "bg-gray-600" },
  { id: "appointment" as const, label: "Appointments", icon: Calendar, color: "bg-blue-500" },
  { id: "medication" as const, label: "Medications", icon: Pill, color: "bg-green-500" },
  { id: "procedure" as const, label: "Procedures", icon: Stethoscope, color: "bg-purple-500" },
  { id: "test" as const, label: "Lab Tests", icon: FlaskConical, color: "bg-orange-500" },
];

export function FilterBar({ selectedFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = selectedFilter === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isActive
                ? `${filter.color} text-white shadow-md`
                : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
