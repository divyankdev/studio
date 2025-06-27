// Error message mapping for backend errors to user-friendly frontend messages
export const ERROR_MESSAGES = {
    // Authentication errors
    INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
    USER_NOT_FOUND: "No account found with this email address.",
    EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
    WEAK_PASSWORD: "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.",
    TOKEN_EXPIRED: "Your session has expired. Please log in again.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
  
    // Account errors
    ACCOUNT_NOT_FOUND: "Account not found. Please check and try again.",
    INSUFFICIENT_BALANCE: "Insufficient account balance for this transaction.",
    ACCOUNT_INACTIVE: "This account is currently inactive.",
    DUPLICATE_ACCOUNT_NAME: "An account with this name already exists.",
  
    // Transaction errors
    TRANSACTION_NOT_FOUND: "Transaction not found.",
    INVALID_AMOUNT: "Please enter a valid amount greater than 0.",
    INVALID_DATE: "Please select a valid date.",
    CATEGORY_REQUIRED: "Please select a category for this transaction.",
    ACCOUNT_REQUIRED: "Please select an account for this transaction.",
    TRANSACTION_LIMIT_EXCEEDED: "Transaction amount exceeds the daily limit.",
  
    // Category errors
    CATEGORY_NOT_FOUND: "Category not found.",
    CATEGORY_IN_USE: "Cannot delete category as it is being used in transactions.",
    DUPLICATE_CATEGORY_NAME: "A category with this name already exists.",
  
    // Budget errors
    BUDGET_NOT_FOUND: "Budget not found.",
    BUDGET_ALREADY_EXISTS: "A budget for this category already exists.",
    INVALID_BUDGET_AMOUNT: "Budget amount must be greater than 0.",
    BUDGET_PERIOD_INVALID: "Please select a valid budget period.",
  
    // Recurring transaction errors
    RECURRING_NOT_FOUND: "Recurring transaction not found.",
    INVALID_FREQUENCY: "Please select a valid frequency.",
    END_DATE_BEFORE_START: "End date cannot be before start date.",
  
    // General errors
    VALIDATION_ERROR: "Please check your input and try again.",
    SERVER_ERROR: "Something went wrong on our end. Please try again later.",
    NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment and try again.",
    FILE_TOO_LARGE: "File size is too large. Please choose a smaller file.",
    INVALID_FILE_TYPE: "Invalid file type. Please choose a supported file format.",
  
    // Default fallback
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  } as const
  
  export type ErrorMessageKey = keyof typeof ERROR_MESSAGES
  
  // Function to get user-friendly error message
  export function getErrorMessage(errorKey: string | ErrorMessageKey, fallbackMessage?: string): string {
    const key = errorKey.toUpperCase() as ErrorMessageKey
    return ERROR_MESSAGES[key] || fallbackMessage || ERROR_MESSAGES.UNKNOWN_ERROR
  }
  
  // Function to extract error key from API response
  export function extractErrorKey(error: any): string {
    if (typeof error === "string") {
      return error.toUpperCase()
    }
  
    if (error?.response?.data?.error) {
      return error.response.data.error.toUpperCase()
    }
  
    if (error?.response?.data?.message) {
      return error.response.data.message.toUpperCase()
    }
  
    if (error?.message) {
      return error.message.toUpperCase()
    }
  
    return "UNKNOWN_ERROR"
  }
  