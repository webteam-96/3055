import { QueryClient } from '@tanstack/react-query'
import { ApiAuthError } from './authToken'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      // An expired/invalid token fails identically on every attempt — surface
      // the session-expired panel immediately instead of retrying.
      retry: (failureCount, error) => !(error instanceof ApiAuthError) && failureCount < 1,
    },
  },
})
