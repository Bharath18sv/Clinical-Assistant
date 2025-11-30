import toast from "react-hot-toast";

/**
 * Extracts error message from API error response
 * @param {Object} error - The error object from axios
 * @returns {string} - The error message
 */
export const getErrorMessage = (error) => {
  // Check if it's an API error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check if it's a network error
  if (error.message) {
    return error.message;
  }

  // Fallback message
  return "An unexpected error occurred";
};

/**
 * Handles API error and displays toast notification
 * @param {Object} error - The error object from axios
 * @param {string} defaultMessage - Default message to show if no specific error message is found
 */
export const handleApiError = (error, defaultMessage = "An error occurred") => {
  const errorMessage = getErrorMessage(error);
  toast.error(errorMessage);
  return errorMessage;
};

/**
 * Handles successful API response and displays toast notification
 * @param {string} message - Success message to display
 */
export const handleApiSuccess = (message) => {
  toast.success(message);
};

export default {
  getErrorMessage,
  handleApiError,
  handleApiSuccess,
};
