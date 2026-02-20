import { useMemo } from "react";
import { Calendar, AlertTriangle, Pill, Stethoscope, Building2, Clock } from "lucide-react";

interface TimelineEntry {
  id: string;
  date: string;
  medication: string;
  department: string;
  doctor: string;
  hospital: string;
  diagnosis: string;
  severity: string;
  lifeThreatening: boolean;
  dosage: string;
  frequency: string;
}

interface MedicalTimelineProps {
  prescriptions: any[];
  onPrescriptionClick: (prescription: any) => void;
}

export function MedicalTimeline({ prescriptions, onPrescriptionClick }: MedicalTimelineProps) {
  // Group prescriptions by year and month
  const groupedByDate = useMemo(() => {
    const grouped: Record<string, Record<string, TimelineEntry[]>> = {};

    prescriptions.forEach((p) => {
      const date = new Date(p.prescriptionDate || p.uploadDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString("default", { month: "long" });

      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }

      grouped[year][month].push({
        id: p.id,
        date: p.prescriptionDate || p.uploadDate,
        medication: p.medicationName,
        department: p.department,
        doctor: p.prescribedBy,
        hospital: p.hospital,
        diagnosis: p.diagnosis || "N/A",
        severity: p.severity,
        lifeThreatening: p.lifeThreatening,
        dosage: p.dosage,
        frequency: p.frequency,
      });
    });

    // Sort entries within each month by date (newest first)
    Object.keys(grouped).forEach((year) => {
      Object.keys(grouped[year]).forEach((month) => {
        grouped[year][month].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
    });

    return grouped;
  }, [prescriptions]);

  const years = Object.keys(groupedByDate).sort((a, b) => parseInt(b) - parseInt(a));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      default:
        return "border-green-500";
    }
  };

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No medical history to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="space-y-6">
          {/* Year Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-lg">
              {year}
            </div>
            <div className="flex-1 h-0.5 bg-gray-200" />
          </div>

          {/* Months */}
          <div className="pl-6 space-y-6">
            {Object.keys(groupedByDate[year])
              .sort((a, b) => {
                const months = [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ];
                return months.indexOf(b) - months.indexOf(a);
              })
              .map((month) => (
                <div key={month} className="space-y-4">
                  {/* Month Header */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">{month}</h3>
                    <span className="text-sm text-gray-500">
                      ({groupedByDate[year][month].length} prescription
                      {groupedByDate[year][month].length !== 1 ? "s" : ""})
                    </span>
                  </div>

                  {/* Timeline Entries */}
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    {groupedByDate[year][month].map((entry) => (
                      <div
                        key={entry.id}
                        className="relative pl-8 cursor-pointer group"
                        onClick={() => {
                          const prescription = prescriptions.find((p) => p.id === entry.id);
                          if (prescription) onPrescriptionClick(prescription);
                        }}
                      >
                        {/* Timeline Dot */}
                        <div
                          className={`absolute -left-2 top-3 w-4 h-4 rounded-full ${getSeverityColor(
                            entry.severity
                          )} ring-4 ring-white`}
                        />

                        {/* Entry Card */}
                        <div
                          className={`bg-white rounded-lg border-l-4 ${getSeverityBorderColor(
                            entry.severity
                          )} shadow-sm hover:shadow-md transition-shadow p-4`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {entry.medication}
                                </h4>
                                {entry.lifeThreatening && (
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(entry.date).toLocaleDateString("default", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(
                                entry.severity
                              )}`}
                            >
                              {entry.severity.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                              <Pill className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600">Dosage</p>
                                <p className="text-gray-900 font-medium">
                                  {entry.dosage} • {entry.frequency}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Building2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600">Department</p>
                                <p className="text-gray-900 font-medium">{entry.department}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Stethoscope className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600">Prescribed by</p>
                                <p className="text-gray-900 font-medium">{entry.doctor}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Building2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-600">Hospital</p>
                                <p className="text-gray-900 font-medium">{entry.hospital}</p>
                              </div>
                            </div>
                          </div>

                          {entry.diagnosis && entry.diagnosis !== "N/A" && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                <strong>Diagnosis:</strong> {entry.diagnosis}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
