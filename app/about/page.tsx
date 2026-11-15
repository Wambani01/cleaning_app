import { Page } from "@/components/ui";
export const metadata = { title: "About" };
export default function About() {
  return (
    <Page title="About Amsta Clean">
      <p>Amsta Clean helps households in Amsterdam find affordable, reliable regular cleaners. For a monthly membership you get access to vetted cleaners at an hourly rate, a backup cleaner when your regular cleaner is not available, and breakage insurance.</p>
      <h2>How we work with cleaners</h2>
      <p>We recruit cleaners by area. Each cleaner applies, has a video interview with us and submits identity documents securely before they are approved.</p>
      <h2>What we promise</h2>
      <ul><li>Clear prices: a monthly membership and an hourly rate, shown before you sign up.</li><li>A backup when your regular cleaner is unavailable.</li><li>Cover for accidental breakage during a visit.</li><li>A real person to help if something goes wrong.</li></ul>
    </Page>
  );
}
