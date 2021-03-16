export const sessionLifeTimeHours = process.env.SESSION_LIFETIME_HOURS
  ? parseInt(process.env.SESSION_LIFETIME_HOURS)
  : 0
