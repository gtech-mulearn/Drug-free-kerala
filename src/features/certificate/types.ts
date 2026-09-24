/** A pledge certificate as shown to its owner. */
export type Certificate = {
  /** Public number printed on the certificate, e.g. "DKFC00042". */
  certificateId: string;
  /** Name exactly as stored with the pledge. */
  name: string;
};

/** Certificate languages: the pledge wording is printed in one of them. */
export type CertificateLanguage = "en" | "ml";

/** Choices shown to the pledger, in their own script. */
export const CERTIFICATE_LANGUAGES: ReadonlyArray<{ value: CertificateLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "ml", label: "മലയാളം" },
];
