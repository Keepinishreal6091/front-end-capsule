import { localDateTimeToUtc, utcToLocalDateTime } from './date-time';

describe('Capsule timezone conversion', () => {
  it('converts a local selection to a canonical UTC instant and back', () => {
    const local = '2099-07-04T14:30';
    const utc = localDateTimeToUtc(local);
    expect(utc).toBe(new Date(local).toISOString());
    expect(utc?.endsWith('Z')).toBeTrue();
    expect(utcToLocalDateTime(utc!)).toBe(local);
  });

  it('interprets offset timestamps as the same instant', () => {
    expect(utcToLocalDateTime('2099-01-01T10:00:00+05:30'))
      .toBe(utcToLocalDateTime('2099-01-01T04:30:00Z'));
  });

  it('rejects invalid and date-only input', () => {
    expect(localDateTimeToUtc('invalid')).toBeNull();
    expect(localDateTimeToUtc('2099-01-01')).toBeNull();
    expect(localDateTimeToUtc('2099-02-30T10:00')).toBeNull();
  });
});
