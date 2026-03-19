// Checks if a user ID is in the allowed list
export function isUserAllowed(userId, allowedUserIdsEnv) {
  if (!allowedUserIdsEnv) return false;
  const allowed = allowedUserIdsEnv
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return allowed.includes(String(userId));
}
