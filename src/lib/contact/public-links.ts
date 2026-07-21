import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  buildBusinessWhatsAppHref,
  buildMailtoHref,
  buildTelHref,
} from "@/lib/contact-messages/format";
import { WEEKDAYS } from "@/lib/settings/constants";
import type { BusinessProfileData } from "@/lib/validations/site-settings";

export type ContactDetailItem = {
  key: string;
  label: string;
  value: string;
  href: string | null;
  external?: boolean;
  icon: "phone" | "whatsapp" | "email" | "address" | "hours";
};

export type PublicContactLinks = {
  phone: string | null;
  phoneHref: string | null;
  email: string | null;
  emailHref: string | null;
  whatsapp: string | null;
  whatsappHref: string | null;
  addressLine: string | null;
  workingHours: string[];
  items: ContactDetailItem[];
};

function formatWorkingHours(businessProfile: BusinessProfileData): string[] {
  if (businessProfile.working_hours.length === 0) {
    return [];
  }

  const dayLabels = new Map(
    WEEKDAYS.map((day) => [day.value, day.label] as const)
  );

  return businessProfile.working_hours.map((entry) => {
    const dayLabel = dayLabels.get(entry.day) ?? entry.day;

    return `${dayLabel}: ${entry.opens}–${entry.closes}`;
  });
}

export function resolvePublicContactLinks(
  businessProfile: BusinessProfileData
): PublicContactLinks {
  const phone = businessProfile.phone?.trim() || null;
  const email = businessProfile.email?.trim() || null;
  const whatsappRaw = businessProfile.social.whatsapp?.trim() || null;
  const whatsappHref = whatsappRaw
    ? buildBusinessWhatsAppHref(whatsappRaw)
    : null;
  const addressLine =
    [businessProfile.address, businessProfile.city]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part))
      .join(", ") || null;
  const workingHours = formatWorkingHours(businessProfile);
  const phoneHref = phone ? buildTelHref(phone) : null;
  const emailHref = email ? buildMailtoHref(email) : null;

  const items: ContactDetailItem[] = [];

  if (phone && phoneHref) {
    items.push({
      key: "phone",
      label: "טלפון",
      value: phone,
      href: phoneHref,
      icon: "phone",
    });
  }

  if (whatsappHref) {
    items.push({
      key: "whatsapp",
      label: "וואטסאפ",
      value: "שליחת הודעה בוואטסאפ",
      href: whatsappHref,
      external: true,
      icon: "whatsapp",
    });
  }

  if (email && emailHref) {
    items.push({
      key: "email",
      label: "אימייל",
      value: email,
      href: emailHref,
      icon: "email",
    });
  }

  if (addressLine) {
    items.push({
      key: "address",
      label: "כתובת",
      value: addressLine,
      href: null,
      icon: "address",
    });
  }

  if (workingHours.length > 0) {
    items.push({
      key: "hours",
      label: "שעות פעילות",
      value: workingHours.join("\n"),
      href: null,
      icon: "hours",
    });
  }

  return {
    phone,
    phoneHref,
    email,
    emailHref,
    whatsapp: whatsappRaw,
    whatsappHref,
    addressLine,
    workingHours,
    items,
  };
}

export const CONTACT_DETAIL_ICONS = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  address: MapPin,
  hours: Clock3,
} as const;
