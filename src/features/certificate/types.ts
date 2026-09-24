/** A pledge certificate as shown to its owner. */
export type Certificate = {
  /** Public number printed on the certificate, e.g. "DKFC00042". */
  certificateId: string;
  /** Name exactly as stored with the pledge. */
  name: string;
};
