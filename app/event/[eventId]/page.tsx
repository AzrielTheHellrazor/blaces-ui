import { EventPageClient } from "./EventPageClient";

type EventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  
  return <EventPageClient eventId={eventId} />;
}
