import { X, Calendar, Activity, MapPin, FileText } from "lucide-react";
import { MedicalEvent } from "../types";

interface EventDetailDialogProps {
  event: MedicalEvent | null;
  onClose: () => void;
}

const eventTypeConfig = {
  appointment: {
    color: "bg-blue-500",
    label: "Appointment",
  },
  medication: {
    color: "bg-green-500",
    label: "Medication",
  },
  procedure: {
    color: "bg-purple-500",
    label: "Procedure",
  },
  test: {
    color: "bg-orange-500",
    label: "Lab Test",
  },
};

export function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  if (!event) return null;

  const config = eventTypeConfig[event.type];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${config.color} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 mb-3">
                {config.label}
              </span>
              <h2 className="text-2xl font-semibold">{event.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-3 text-gray-400" />
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Description
            </h3>
            <p className="text-gray-900">{event.description}</p>
          </div>

          {event.provider && (
            <div className="flex items-start">
              <Activity className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Provider
                </h3>
                <p className="text-gray-900">{event.provider}</p>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Location
                </h3>
                <p className="text-gray-900">{event.location}</p>
              </div>
            </div>
          )}

          {event.notes && (
            <div className="flex items-start">
              <FileText className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Additional Notes
                </h3>
                <p className="text-gray-900">{event.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
