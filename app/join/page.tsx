import { brand } from "@/lib/brand";
export const metadata = { title: "Become a member" };

export default function Join() {
  return (
    <main><section><div className="wrap">
      <h2>Cleaning membership</h2>
      <div className="grid">
        <div className="card"><div className="price">{brand.price}<span className="muted" style={{fontSize:16}}> / month</span></div>
          <ul><li>Regular cleaner at an hourly rate</li><li>Backup cleaner if yours is unavailable</li><li>Breakage insurance</li></ul>
          <p className="note">Online sign-up and payment (Stripe, incl. iDEAL) is coming soon. Leave your details and we will contact you.</p>
        </div>
        <form action="#" aria-label="Waitlist">
          <label>Name<input name="name" required /></label>
          <label>Email<input type="email" name="email" required /></label>
          <label>Postcode<input name="postcode" placeholder="1011 AB" /></label>
          <button className="btn full" type="submit" disabled>Join waitlist (coming soon)</button>
        </form>
      </div>
    </div></section></main>
  );
}
