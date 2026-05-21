export const setAccessToken = (token: string): void => {
  localStorage.setItem('token', token)
}

export const getAccessToken = (): string | null => {
  return typeof localStorage === 'object' ? localStorage.getItem('token') : null
}
