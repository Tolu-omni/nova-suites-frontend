function publicValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

export const hotelContact = {
  address: publicValue(process.env.NEXT_PUBLIC_HOTEL_ADDRESS),
  phone: publicValue(process.env.NEXT_PUBLIC_HOTEL_PHONE),
  email: publicValue(process.env.NEXT_PUBLIC_HOTEL_EMAIL),
  legalEmail: publicValue(process.env.NEXT_PUBLIC_HOTEL_LEGAL_EMAIL),
};

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^+\\d]/g, '')}`;
}

export function emailHref(email: string): string {
  return `mailto:${email}`;
}
