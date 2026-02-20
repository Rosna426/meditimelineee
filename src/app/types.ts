export type EventType = "appointment" | "medication" | "procedure" | "test";

export interface MedicalEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  date: string;
  provider?: string;
  location?: string;
  notes?: string;
}
