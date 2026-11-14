import Link from "next/link";
import { brand } from "@/lib/brand";

const features = [
  { t: "Affordable regular cleaners", d: "The same vetted cleaner every visit, at a fair hourly rate." },
  { t: "Backup cleaner included", d: "If your cleaner is unavailable, we send a backup so you are never left without." },
  { t: "Breakage insurance", d: "Accidents happen. Cover for breakage is part of your membership." },
];

export default function Home() {
  return (
    <main>
      <div className="hero"><div className="wrap">
        <h1>{brand.tagline}</h1>
        <p>Join for {brand.price} a month and get access to trusted cleaners across Amsterdam.</p>
        <Link className="btn" href="/join">Become a member</Link>
        <Link className="btn alt" href="/apply">I'm a cleaner</Link>
      </div></div>
      <section><div className="wrap">
        <h2>What you get</h2>
        <div className="grid">{features.map(f => <div className="card" key={f.t}><h3>{f.t}</h3><p className="muted">{f.d}</p></div>)}</div>
      </div></section>
      <section><div className="wrap">
        <h2>How it works</h2>
        <ol className="steps"><li>Join the cleaning membership.</li><li>Tell us your address and how often you need cleaning.</li><li>We match you with a regular cleaner and a backup.</li><li>Pay the hourly rate for each visit.</li></ol>
      </div></section>
    </main>
  );
}
