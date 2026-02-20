import { useState, useEffect, useRef } from "react";
import {
  Activity,
  Upload,
  Camera,
  FileText,
  AlertTriangle,
  Info,
  TrendingUp,
  LogOut,
  Trash2,
  X,
  Grid,
  List,
  FileBarChart,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { projectId } from "/utils/supabase/info";
import { MedicalSummary } from "../components/MedicalSummary";
import { MedicalTimeline } from "../components/MedicalTimeline";
import { PrescriptionSearch } from "../components/PrescriptionSearch";

interface Prescription {
  id: string;
  fileName: string;
  imageUrl: string;
  uploadDate: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  department: string;
  prescribedBy: string;
  hospital: string;
  prescriptionDate: string;
  diagnosis: string;
  instructions: string;
  severity: string;
  lifeThreatening: boolean;
}

interface Alert {
  type: string;
  title: string;
  message: string;
  timestamp: string;
}

interface HealthSummary {
  totalPrescriptions: number;
  departments: Record<string, number>;
  activeMedications: string[];
  doctorsVisited: string[];
  hospitalsVisited: string[];
  recentAlerts: Alert[];
  lastUpdated: string;
}

export function Dashboard() {
  const { user, accessToken, signOut } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showMedicalSummary, setShowMedicalSummary] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilteredPrescriptions(prescriptions);
  }, [prescriptions]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load prescriptions
      const prescRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d794bcda/prescriptions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const prescData = await prescRes.json();
      setPrescriptions(prescData.prescriptions || []);

      // Load health summary
      const summaryRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d794bcda/health-summary`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);
      setAlerts(summaryData.summary?.recentAlerts || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d794bcda/upload-prescription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              imageData,
              fileName: file.name,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload prescription");
        }

        // Add new prescription and alerts
        setPrescriptions((prev) => [result.prescription, ...prev]);
        if (result.alerts && result.alerts.length > 0) {
          setAlerts((prev) => [...result.alerts, ...prev]);
        }

        // Reload summary
        await loadData();
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload prescription");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (prescriptionId: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d794bcda/prescription/${prescriptionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete prescription");
      }

      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
      await loadData();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete prescription");
    }
  };

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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your medical timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediTimeline</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMedicalSummary(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <FileBarChart className="w-5 h-5" />
                <span className="hidden sm:inline">Medical Summary</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.slice(0, 3).map((alert, index) => (
              <div
                key={index}
                className={`${getAlertBgColor(alert.type)} border rounded-lg p-4 flex items-start gap-3`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload Prescription
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-gray-700">
                {uploading ? "Uploading..." : "Choose from Files"}
              </span>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              <Camera className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-gray-700">
                {uploading ? "Uploading..." : "Take Photo"}
              </span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
        </div>

        {/* Health Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.totalPrescriptions}
                  </div>
                  <div className="text-sm text-gray-600">Total Prescriptions</div>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.activeMedications.length}
                  </div>
                  <div className="text-sm text-gray-600">Medications</div>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.keys(summary.departments).length}
                  </div>
                  <div className="text-sm text-gray-600">Departments</div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.doctorsVisited.length}
                  </div>
                  <div className="text-sm text-gray-600">Doctors</div>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Department Breakdown */}
        {summary && Object.keys(summary.departments).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Department Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(summary.departments).map(([dept, count]) => (
                <div key={dept} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600 mt-1">{dept}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescriptions Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Prescriptions
              {filteredPrescriptions.length !== prescriptions.length && (
                <span className="ml-2 text-sm text-gray-500">
                  ({filteredPrescriptions.length} of {prescriptions.length})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  viewMode === "timeline"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Timeline</span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <PrescriptionSearch
              prescriptions={prescriptions}
              onFilteredResults={setFilteredPrescriptions}
            />
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {prescriptions.length === 0
                  ? "No prescriptions yet. Upload your first prescription to get started!"
                  : "No prescriptions match your search criteria."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <img
                    src={prescription.imageUrl}
                    alt={prescription.fileName}
                    className="w-full h-48 object-cover bg-gray-100"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(
                              prescription.severity
                            )}`}
                          >
                            {prescription.severity.toUpperCase()}
                          </span>
                          {prescription.lifeThreatening && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {prescription.medicationName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {prescription.department}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(prescription.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Dosage: {prescription.dosage}</p>
                      <p>Doctor: {prescription.prescribedBy}</p>
                      <p className="text-xs">
                        {new Date(prescription.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MedicalTimeline
              prescriptions={filteredPrescriptions}
              onPrescriptionClick={setSelectedPrescription}
            />
          )}
        </div>
      </main>

      {/* Medical Summary Modal */}
      {showMedicalSummary && (
        <MedicalSummary onClose={() => setShowMedicalSummary(false)} />
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedPrescription(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Prescription Details</h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <img
                src={selectedPrescription.imageUrl}
                alt={selectedPrescription.fileName}
                className="w-full rounded-lg mb-6"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Medication</h3>
                  <p className="text-gray-900 font-semibold">{selectedPrescription.medicationName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="text-gray-900">{selectedPrescription.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dosage</h3>
                  <p className="text-gray-900">{selectedPrescription.dosage}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Frequency</h3>
                  <p className="text-gray-900">{selectedPrescription.frequency}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="text-gray-900">{selectedPrescription.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Prescribed By</h3>
                  <p className="text-gray-900">{selectedPrescription.prescribedBy}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Hospital</h3>
                  <p className="text-gray-900">{selectedPrescription.hospital}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-900">
                    {new Date(selectedPrescription.prescriptionDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedPrescription.diagnosis && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                    <p className="text-gray-900">{selectedPrescription.diagnosis}</p>
                  </div>
                )}
                {selectedPrescription.instructions && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Instructions</h3>
                    <p className="text-gray-900">{selectedPrescription.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
