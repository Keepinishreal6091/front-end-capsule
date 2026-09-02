/** Interpret datetime-local in the client's timezone; reject DST-gap normalization. */
export function localDateTimeToUtc(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || utcToLocalDateTime(parsed.toISOString()) !== value) return null;
  return parsed.toISOString();
}

export function utcToLocalDateTime(instant: string): string {
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
