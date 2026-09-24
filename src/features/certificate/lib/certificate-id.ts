/**
 * Public certificate number for a pledge. "DKFC" + zero-padded id, the format
 * printed on every certificate issued since launch; do not change it.
 */
export function formatCertificateId(pledgeId: number): string {
  if (!Number.isSafeInteger(pledgeId) || pledgeId <= 0) {
    throw new RangeError(`Invalid pledge id: ${pledgeId}`);
  }
  return `DKFC${String(pledgeId).padStart(5, "0")}`;
}
