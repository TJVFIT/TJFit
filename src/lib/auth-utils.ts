import "server-only";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function configuredAdminEmails() {
  const values = [
    process.env.ADMIN_EMAILS,
    process.env.ADMIN_EMAIL
  ].filter((value): value is string => Boolean(value));

  return new Set(
    values
      .flatMap((value) => value.split(","))
      .map(normalizeEmail)
      .filter(Boolean)
  );
}

/**
 * Optional bootstrap allow-list. Database profile roles remain authoritative
 * for normal authorization and no user-editable metadata is trusted.
 */
export function isAdminEmail(email: string) {
  return configuredAdminEmails().has(normalizeEmail(email));
}
