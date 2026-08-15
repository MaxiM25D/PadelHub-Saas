-- PostgreSQL is the final authority for availability. The API must translate a
-- constraint violation into HTTP 409 so concurrent requests cannot double-book.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_valid_time_range"
CHECK ("endsAt" > "startsAt");

ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_no_overlapping_active_slots"
EXCLUDE USING GIST (
  "courtId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" IN ('PENDING', 'CONFIRMED'));
