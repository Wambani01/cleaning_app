// Shared checks for phone numbers and Dutch addresses. Pure functions, safe on the server and in the browser.
export type AddressDetails = { phone: string; street: string; houseNumber: string; houseNumberAddition: string; postcode: string; city: string };

export const POSTCODE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
export const PHONE = /^[+0-9()\s-]{8,20}$/;

/** Checks just the address part. Returns an error message, or "" when valid. */
export function checkAddress(d: Pick<AddressDetails, "street" | "houseNumber" | "houseNumberAddition" | "postcode" | "city">): string {
  if (d.street.trim().length < 2) return "Please enter your street name.";
  if (!/^[0-9]{1,5}$/.test(d.houseNumber.trim())) return "Please enter your house number (numbers only, for example 12).";
  if (d.houseNumberAddition.trim().length > 10) return "The house number addition is too long.";
  if (!POSTCODE.test(d.postcode.trim())) return "Please enter a valid postcode, for example 1011 AB.";
  if (d.city.trim().length < 2) return "Please enter your city.";
  return "";
}

/** Returns an error message, or "" when the phone number and address are valid. */
export function checkAddressDetails(d: AddressDetails): string {
  if (!PHONE.test(d.phone.trim())) return "Please enter a valid phone number.";
  return checkAddress(d);
}

export const tidyPostcode = (p: string) => p.trim().toUpperCase().replace(/^(\d{4})\s?/, "$1 ");
