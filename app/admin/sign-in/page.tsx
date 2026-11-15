import { SignInPage } from "@/components/portal-shell";
export const metadata = { title: "Admin sign in", robots: { index: false } };
export default function Page() { return <SignInPage portal="admin" />; }
