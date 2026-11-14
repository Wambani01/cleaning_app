export const metadata = { title: "Work with us" };

export default function Apply() {
  return (
    <main><section><div className="wrap">
      <h2>Work as a cleaner</h2>
      <p className="muted">We are recruiting cleaners across Amsterdam. Apply below, then we will invite you to a video interview and ask for your documents.</p>
      <ol className="steps"><li>Submit this application</li><li>Video interview</li><li>Upload ID and documents securely</li><li>Approval and first jobs</li></ol>
      <form action="#" aria-label="Cleaner application">
        <label>Full name<input name="name" required /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Phone<input name="phone" required /></label>
        <label>Area<select name="area"><option>Amsterdam Centrum</option><option>Noord</option><option>Oost</option><option>Zuid</option><option>West</option><option>Nieuw-West</option><option>Zuidoost</option></select></label>
        <label>Experience<textarea name="exp" rows={4} /></label>
        <p className="note">Never send ID documents by email. We will give you a secure upload link after the interview.</p>
        <button className="btn full" type="submit" disabled>Submit (coming soon)</button>
      </form>
    </div></section></main>
  );
}
