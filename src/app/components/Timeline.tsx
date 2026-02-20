import { Activity, Calendar, Pill, Stethoscope, FlaskConical } from "lucide-react";
import { MedicalEvent } from "../types";

interface TimelineProps {
  events: MedicalEvent[];
  onEventClick: (event: MedicalEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const eventTypeConfig = {
  appointment: {
    icon: Calendar,
    color: "bg-blue-500",
    label: "Appointment",
  },
  medication: {
    icon: Pill,
    color: "bg-green-500",
    label: "Medication",
  },
  procedure: {
    icon: Stethoscope,
    color: "bg-purple-500",
    label: "Procedure",
  },
  test: {
    icon: FlaskConical,
    color: "bg-orange-500",
    label: "Lab Test",
  },
};

export function Timeline({ events, onEventClick, onDeleteEvent }: TimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[27px] top-0 bottom-0 w-[2px] bg-gray-200" />

      {/* Events */}
      <div className="space-y-8">
        {sortedEvents.map((event) => {
          const config = eventTypeConfig[event.type];
          const Icon = config.icon;

          return (
            <div key={event.id} className="relative pl-16">
              {/* Timeline dot */}
              <div
                className={`absolute left-0 w-14 h-14 rounded-full ${config.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Event card */}
              <div
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                onClick={() => onEventClick(event)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} mb-2`}
                    >
                      {config.label}
                    </span>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {event.title}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(event.date)}
                </div>

                <p className="text-gray-600 mb-3">{event.description}</p>

                {event.provider && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Activity className="w-4 h-4 mr-2" />
                    <span className="font-medium">{event.provider}</span>
                    {event.location && (
                      <span className="ml-2">• {event.location}</span>
                    )}
                  </div>
                )}

                {event.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic">{event.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No medical events yet. Add your first event to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
