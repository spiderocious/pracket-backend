import { randomBytes } from 'node:crypto';

const raw = (): string => randomBytes(8).toString('hex').toUpperCase();

export const ids = {
  user: () => `USR_${raw()}`,
  tutor: () => `TUT_${raw()}`,
  credential: () => `CRD_${raw()}`,
  connection: () => `CON_${raw()}`,
  message: () => `MSG_${raw()}`,
  post: () => `PST_${raw()}`,
  report: () => `RPT_${raw()}`,
  shortlist: () => `SHL_${raw()}`,
  review: () => `RVW_${raw()}`,
};
