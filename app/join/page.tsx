import { Card, Container, Note, hourlyRate, price } from "@/components/ui";
import { WaitlistForm } from "@/components/forms";
export const metadata = { title: "I need regular cleaning" };

export default function Join() {
  return (
    <main className="py-14"><Container>
      <h1 className="mb-6 text-3xl font-bold">I need regular cleaning</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="text-4xl font-extrabold text-primary-dark">{price}<span className="text-base font-normal text-muted"> / month</span></div>
          <div className="mt-1 text-lg font-semibold">+ {hourlyRate} per hour of cleaning</div>
          <ul className="my-4 list-disc space-y-1 pl-5"><li>Regular cleaner at {hourlyRate} per hour</li><li>Backup cleaner if yours is unavailable</li><li>Breakage insurance</li></ul>
          <Note>Online payment is coming soon. Leave your details and we will contact you as soon as we have a regular cleaner for you.</Note>
        </Card>
        <WaitlistForm />
      </div>
    </Container></main>
  );
}
