import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Activity,
  AlertTriangle,
  Share2,
  Printer,
  X,
  User,
  MapPin,
  Pill,
  Stethoscope,
  Building2,
  Clock,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { projectId } from "/utils/supabase/info";

interface ComprehensiveSummary {
  userInfo: {
    name: string;
    email: string;
    userId: string;
  };
  overview: {
    totalPrescriptions: number;
    activeMedications: number;
    totalDepartments: number;
    totalDoctors: number;
    totalHospitals: number;
    criticalConditions: number;
    firstPrescriptionDate: string;
    lastPrescriptionDate: string;
  };
  departmentBreakdown: Record<string, number>;
  medications: Array<{
    name: string;
    department: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    date: string;
    isActive: boolean;
  }>;
  medicalHistory: Array<{
    date: string;
    medication: string;
    diagnosis: string;
    doctor: string;
    hospital: string;
    department: string;
    severity: string;
  }>;
  criticalAlerts: Array<{
    type: string;
    title: string;
    message: string;
    date: string;
  }>;
  doctorsAndHospitals: {
    doctors: string[];
    hospitals: string[];
  };
  generatedAt: string;
}

interface MedicalSummaryProps {
  onClose: () => void;
}

export function MedicalSummary({ onClose }: MedicalSummaryProps) {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<ComprehensiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d794bcda/comprehensive-summary`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load summary");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Failed to load medical summary");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d794bcda/export-summary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ format: "pdf" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-history-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Failed to download PDF");
    }
  };

  const handleDownloadJSON = () => {
    if (!summary) return;

    const dataStr = JSON.stringify(summary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-history-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!summary) return;

    const shareText = generateShareableText(summary);

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Medical History Summary",
          text: shareText,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Summary copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  const generateShareableText = (summary: ComprehensiveSummary): string => {
    return `
MEDICAL HISTORY SUMMARY
Generated: ${new Date(summary.generatedAt).toLocaleString()}

PATIENT INFORMATION
Name: ${summary.userInfo.name}
Email: ${summary.userInfo.email}

OVERVIEW
Total Prescriptions: ${summary.overview.totalPrescriptions}
Active Medications: ${summary.overview.activeMedications}
Departments Visited: ${summary.overview.totalDepartments}
Doctors Consulted: ${summary.overview.totalDoctors}
Hospitals/Clinics: ${summary.overview.totalHospitals}
Critical Conditions: ${summary.overview.criticalConditions}
First Record: ${new Date(summary.overview.firstPrescriptionDate).toLocaleDateString()}
Last Record: ${new Date(summary.overview.lastPrescriptionDate).toLocaleDateString()}

DEPARTMENT BREAKDOWN
${Object.entries(summary.departmentBreakdown)
  .map(([dept, count]) => `${dept}: ${count} prescription(s)`)
  .join("\n")}

CURRENT MEDICATIONS
${summary.medications
  .filter((m) => m.isActive)
  .map(
    (m) =>
      `- ${m.name} (${m.dosage}, ${m.frequency}) - Prescribed by ${m.prescribedBy}`
  )
  .join("\n")}

HEALTHCARE PROVIDERS
Doctors: ${summary.doctorsAndHospitals.doctors.join(", ")}
Hospitals: ${summary.doctorsAndHospitals.hospitals.join(", ")}

${
  summary.criticalAlerts.length > 0
    ? `CRITICAL ALERTS
${summary.criticalAlerts.map((a) => `[${a.type.toUpperCase()}] ${a.title}: ${a.message}`).join("\n")}`
    : ""
}

---
This is an automated summary. For medical decisions, please consult your healthcare provider.
    `.trim();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Generating your medical summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="min-h-screen px-4 py-8">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between print:bg-white print:text-gray-900 print:border-b">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Comprehensive Medical History</h2>
                <p className="text-sm opacity-90">
                  Generated on {new Date(summary.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors print:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-b bg-gray-50 flex flex-wrap gap-3 print:hidden">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Patient Info */}
            <section className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{summary.userInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{summary.userInfo.email}</p>
                </div>
              </div>
            </section>

            {/* Overview Statistics */}
            <section className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Medical Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Prescriptions</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {summary.overview.totalPrescriptions}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Active Medications</p>
                  <p className="text-3xl font-bold text-green-600">
                    {summary.overview.activeMedications}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {summary.overview.totalDepartments}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Doctors Consulted</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {summary.overview.totalDoctors}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    First Record
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(summary.overview.firstPrescriptionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Latest Record
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(summary.overview.lastPrescriptionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {summary.overview.criticalConditions > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="flex items-center gap-2 text-red-800 font-semibold">
                    <AlertTriangle className="w-5 h-5" />
                    {summary.overview.criticalConditions} Critical Condition(s) Detected
                  </p>
                </div>
              )}
            </section>

            {/* Department Breakdown */}
            <section className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Department Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(summary.departmentBreakdown).map(([dept, count]) => (
                  <div key={dept} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                    <p className="text-sm text-gray-700 mt-1">{dept}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Current Medications */}
            <section className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                Current Medications
              </h3>
              {summary.medications.filter((m) => m.isActive).length === 0 ? (
                <p className="text-gray-500">No active medications</p>
              ) : (
                <div className="space-y-3">
                  {summary.medications
                    .filter((m) => m.isActive)
                    .map((med, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {med.dosage} • {med.frequency}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Department: {med.department}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-gray-600">Prescribed by</p>
                            <p className="font-medium text-gray-900">{med.prescribedBy}</p>
                            <p className="text-gray-500 mt-1">
                              {new Date(med.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* Healthcare Providers */}
            <section className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Healthcare Providers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Doctors ({summary.doctorsAndHospitals.doctors.length})
                  </p>
                  <ul className="space-y-2">
                    {summary.doctorsAndHospitals.doctors.map((doctor, index) => (
                      <li key={index} className="text-gray-600 pl-4 border-l-2 border-blue-200">
                        {doctor}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Hospitals & Clinics ({summary.doctorsAndHospitals.hospitals.length})
                  </p>
                  <ul className="space-y-2">
                    {summary.doctorsAndHospitals.hospitals.map((hospital, index) => (
                      <li key={index} className="text-gray-600 pl-4 border-l-2 border-purple-200">
                        {hospital}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Medical Timeline */}
            <section className="border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Medical Timeline
              </h3>
              <div className="space-y-4">
                {summary.medicalHistory.map((entry, index) => (
                  <div key={index} className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600" />
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{entry.medication}</p>
                          <p className="text-sm text-gray-600">{entry.department}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            entry.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : entry.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {entry.severity}
                        </span>
                      </div>
                      {entry.diagnosis && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Diagnosis:</strong> {entry.diagnosis}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{entry.doctor}</span>
                        <span>•</span>
                        <span>{entry.hospital}</span>
                        <span>•</span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Critical Alerts */}
            {summary.criticalAlerts.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Critical Alerts
                </h3>
                <div className="space-y-3">
                  {summary.criticalAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        alert.type === "critical"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            alert.type === "critical" ? "text-red-600" : "text-yellow-600"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <section className="border-t pt-6">
              <p className="text-xs text-gray-500 text-center">
                This is an automated medical history summary generated from your uploaded prescriptions.
                <br />
                For medical decisions and treatment, always consult with qualified healthcare professionals.
                <br />
                Generated on {new Date(summary.generatedAt).toLocaleString()} • MediTimeline
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
