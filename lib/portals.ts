export type Portal = "customer" | "cleaner" | "admin";

export const portals: Record<Portal, { label: string; role: Portal; home: string; signIn: string; signUp: string | null }> = {
  customer: { label: "Customer", role: "customer", home: "/customer", signIn: "/customer/sign-in", signUp: "/customer/sign-up" },
  cleaner: { label: "Cleaner", role: "cleaner", home: "/cleaner", signIn: "/cleaner/sign-in", signUp: "/cleaner/sign-up" },
  // Admin accounts are never created through sign-up. They are promoted in the database.
  admin: { label: "Admin", role: "admin", home: "/admin", signIn: "/admin/sign-in", signUp: null },
};
