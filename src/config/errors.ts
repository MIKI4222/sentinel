export const USER_ERROR_MESSAGES = {
  'only owner can change monitored URL': 'Only the contract owner can change the monitored URL.',
  'monitored URL must not be empty': 'The monitored URL cannot be empty.',
  'circuit breaker is active': 'Protection triggered: the circuit breaker is paused. This is an expected contract rejection.',
  'only owner can unpause': 'Only the contract owner can unpause.',
  'operational health check required': 'An operational verdict for the current endpoint is required. The contract does not check its age.',
  'operational verdict belongs to another URL': 'The operational verdict belongs to another URL. Check the current endpoint.',
} as const;
export type UserErrorCode = keyof typeof USER_ERROR_MESSAGES;
export function getUserErrorMessage(error: string): string {
  return Object.hasOwn(USER_ERROR_MESSAGES, error) ? USER_ERROR_MESSAGES[error as UserErrorCode] : error;
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unexpected error';
}
export function isSignatureRejected(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const obj = error as Record<string, unknown>;
  return obj.code === 4001 || obj.code === '4001' || obj.name === 'UserRejectedRequestError' || isSignatureRejected(obj.cause);
}
