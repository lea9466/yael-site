/**
 * Convert free-text Hebrew/English prep durations (e.g. "30 דקות", "שעה")
 * into Schema.org ISO-8601 duration (PT30M, PT1H). Returns null when unknown.
 */
export function parseDurationToIso8601(input: string): string | null {
  const text = input.trim();

  if (!text) {
    return null;
  }

  if (/^P(T)?[\dHMS.]+$/i.test(text)) {
    return text.toUpperCase();
  }

  let hours = 0;
  let minutes = 0;

  // Avoid \b — it breaks on Hebrew letters (non-ASCII word chars).
  const hourMatch = text.match(
    /(\d+(?:[.,]\d+)?)\s*(?:שעות|שעה|hours?|hrs?|h)(?!\S)/i
  );
  const minuteMatch = text.match(
    /(\d+(?:[.,]\d+)?)\s*(?:דקות|דקה|דק׳|דק'|דקים|דק|minutes?|mins?|m)(?!\S)/i
  );

  if (hourMatch) {
    hours += Number.parseFloat(hourMatch[1].replace(",", "."));
  }

  if (minuteMatch) {
    minutes += Number.parseFloat(minuteMatch[1].replace(",", "."));
  }

  if (!hourMatch && !minuteMatch) {
    if (/^שעתיים$/i.test(text)) {
      hours = 2;
    } else if (/^שעה$/i.test(text)) {
      hours = 1;
    } else if (/^חצי\s*שעה$/i.test(text)) {
      minutes = 30;
    } else {
      const bareNumber = text.match(/^(\d+(?:[.,]\d+)?)$/);

      if (bareNumber) {
        minutes = Number.parseFloat(bareNumber[1].replace(",", "."));
      }
    }
  }

  const totalMinutes = Math.round(hours * 60 + minutes);

  if (totalMinutes <= 0) {
    return null;
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) {
    return `PT${h}H${m}M`;
  }

  if (h > 0) {
    return `PT${h}H`;
  }

  return `PT${m}M`;
}
