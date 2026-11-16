import { hourlyRate, price } from "@/components/ui";
import type { Faq } from "@/components/sections";

// Everything below describes what the business actually offers today. Do not add claims that the product cannot back up.

export const homeownerFaqs: Faq[] = [
  { q: "What does it cost?", a: `${price} per month for the membership, plus ${hourlyRate} per hour for each hour of cleaning. You will not be charged when you create an account. Online payment is coming soon.` },
  { q: "How do I get matched with a cleaner?", a: "You create an account and tell us your address and phone number. We then look at our approved cleaners near your home and match you with a regular cleaner and a backup. We call you for a short orientation call before the first visit." },
  { q: "Can I choose my own cleaner?", a: "We do the matching for you, so you do not have to compare profiles. On the orientation call you can tell us what matters to you, and we take that into account." },
  { q: "What if my regular cleaner is ill or on holiday?", a: "Your backup cleaner steps in. If neither is available we will tell you as early as possible and arrange a solution." },
  { q: "What does the breakage insurance cover?", a: "Accidental damage to your belongings during a visit. The full conditions will be published before launch." },
  { q: "How are cleaners checked?", a: "Every cleaner applies, has a video interview with us and submits identity documents before they are approved." },
  { q: "Can I cancel?", a: "Yes. You can cancel your membership online. The cancellation terms will be shown clearly before you sign up." },
  { q: "Which areas do you cover?", a: "Amsterdam. Enter your postcode when you create your account and we will confirm." },
];

export const cleanerFaqs: Faq[] = [
  { q: "Am I an employee of Amsta Clean?", a: "No. You work as an independent freelancer (zzp). You run your own business, can work for other clients too, and invoice for your work. We explain how this works in the interview." },
  { q: "How much will I earn?", a: "We explain the rates, how and when you are paid, and how invoicing works in the interview, so you can decide with all the facts. As a freelancer you are responsible for your own tax and insurance." },
  { q: "Does it cost anything to apply?", a: "You are not asked to pay anything to submit an application. We explain any conditions of working with us in the interview, before you decide." },
  { q: "How do I find customers?", a: "Once you are approved, we match you with households near you, as a regular cleaner or as a backup. You see your customers in your cleaner account." },
  { q: "Will I be told where I am going before a visit?", a: "Yes. Your cleaner account shows the first name and address of each household you are matched with." },
  { q: "Do I need my own cleaning supplies?", a: "We will tell you what is provided for each customer and what to bring." },
  { q: "Can I choose my days and hours?", a: "Yes. You tell us when you are available and we only offer matches that fit." },
  { q: "What if I cannot make a visit?", a: "Tell us as early as possible. We arrange the customer's backup cleaner so the visit is covered." },
  { q: "Is my personal data safe?", a: "Your documents are used only to verify you, are stored securely, and are seen only by authorised staff. See our privacy policy." },
  { q: "Do I need experience?", a: "Experience helps, but it is not always required. Tell us about yourself in the application." },
];
