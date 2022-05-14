export function notFoundIfFalsy<T>(value: T | null | undefined): T {
  if (!value) throw new Response(null, { status: 404 });

  return value;
}
