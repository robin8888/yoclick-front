/** Una solicitud sin responder cuyo plazo ya pasó. */
export function isRequestOverdue(request: { status: string; dueAt: string }, now: Date): boolean {
  return request.status === 'open' && Date.parse(request.dueAt) < now.getTime();
}
