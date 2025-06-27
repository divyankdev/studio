import { toast } from "@/hooks/use-toast"
import { getErrorMessage, extractErrorKey } from "@/constants/error-messages"

// Common error handler function
export function handleError(error: any, customMessage?: string) {
  console.error("Error occurred:", error)

  const errorKey = extractErrorKey(error)
  const message = customMessage || getErrorMessage(errorKey)

  toast({
    variant: "destructive",
    title: "Error",
    description: message,
  })
}

// Success handler function
export function handleSuccess(message: string, description?: string) {
  toast({
    title: message,
    description: description,
  })
}

// API error handler with retry logic
export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  successMessage?: string,
  errorMessage?: string,
): Promise<T | null> {
  try {
    const result = await apiCall()
    if (successMessage) {
      handleSuccess(successMessage)
    }
    return result
  } catch (error) {
    handleError(error, errorMessage)
    return null
  }
}

// Form validation error handler
export function handleValidationErrors(errors: Record<string, any>) {
  const errorMessages = Object.entries(errors)
    .map(([field, error]) => `${field}: ${error.message || error}`)
    .join(", ")

  toast({
    variant: "destructive",
    title: "Validation Error",
    description: errorMessages,
  })
}

// Network error handler
export function handleNetworkError() {
  toast({
    variant: "destructive",
    title: "Connection Error",
    description: "Unable to connect to the server. Please check your internet connection and try again.",
  })
}
