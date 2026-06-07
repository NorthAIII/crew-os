/**
 * Saf Cal.com payload parser — DB bağımlılığı YOK (CI-güvenli test).
 */
export type CalcomEvent = "BOOKING_CREATED" | "BOOKING_CANCELLED" | "BOOKING_RESCHEDULED";

export interface ParsedBooking {
  event: CalcomEvent;
  email: string;
  firstName: string;
  lastName: string;
  bookingUid: string;
  startTime: string | null;
  eventTitle: string;
}

/** Cal.com payload'ını normalize eder (çeşitli alan adlarını tolere eder). */
export function parseCalcomPayload(raw: unknown): ParsedBooking {
  const body = (raw ?? {}) as Record<string, any>;
  const event = (body.triggerEvent as CalcomEvent) || "BOOKING_CREATED";
  const booking = (body.payload ?? body) as Record<string, any>;
  const attendee = (booking.attendees?.[0] ?? {}) as Record<string, any>;

  const email = (attendee.email || booking.attendeeEmail || "").trim();
  const name = (attendee.name || booking.attendeeName || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return {
    event,
    email,
    firstName,
    lastName,
    bookingUid: booking.uid || booking.bookingId || "",
    startTime: booking.startTime || booking.start || null,
    eventTitle: booking.title || booking.eventTitle || "Discovery Call",
  };
}
