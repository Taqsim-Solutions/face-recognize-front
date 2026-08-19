/**
 * URL builder for the backend's image endpoint.
 *
 * The endpoint serves pupils' face photos and is being closed to anonymous
 * callers (backend: `Security:ProtectImages`). Because these URLs are consumed
 * by plain `<img src>` tags, which cannot send an `Authorization` header, the
 * token has to travel in the query string - the API's JWT middleware accepts
 * `?token=` for exactly this reason.
 *
 * Appending the token is harmless while the flag is off, so shipping this ahead
 * of time means the backend switch can be flipped without another frontend
 * release.
 */
export function getImageUrl(filename: string | null | undefined): string {
  if (!filename) return ''

  const url = `/api/images?filename=${encodeURIComponent(filename)}`
  const token = localStorage.getItem('token')

  return token ? `${url}&token=${encodeURIComponent(token)}` : url
}
