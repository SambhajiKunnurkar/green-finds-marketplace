
import { toast } from "sonner";

// Mock user data for demo/fallback mode
export const MOCK_USER = {
  id: "mock-user-123",
  name: "Demo User",
  email: "demo@example.com",
  address: {
    street: "123 Eco Street",
    city: "Green City",
    state: "Nature State",
    zipCode: "12345"
  }
};

// Update the API base URL to match what's configured in vite.config.ts
// export const API_BASE_URL = "http://localhost:5000/api";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Notification state management object
const notificationState = {
  demoModeNotificationShown: false,
  resetNotificationState() {
    this.demoModeNotificationShown = false;
  }
};

// Improve the helper to check if a response is valid JSON
export const isJsonResponse = async (response: Response): Promise<boolean> => {
  try {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON content type received:', contentType);
      return false;
    }
    
    // Try to clone and parse a small part of the response to verify it's valid JSON
    const clonedResponse = response.clone();
    await clonedResponse.json();
    return true;
  } catch (error) {
    console.error('Error validating JSON response:', error);
    return false;
  }
};

export const handleAuthError = (setToken: (token: string) => void, setCurrentUser: (user: any) => void) => {
  localStorage.removeItem("ecoCartToken");
  setToken("");
  setCurrentUser(null);
};

// Show demo mode notification with state tracking
export const showDemoModeNotification = () => {
  if (!notificationState.demoModeNotificationShown) {
    toast.info("Using demo mode - API connection failed", {
      duration: 5000,
      id: "demo-mode-notification",
      onAutoClose: () => {
        notificationState.demoModeNotificationShown = false;
      }
    });
    notificationState.demoModeNotificationShown = true;
  }
};

export const enableDemoMode = (
  setDemoMode: (value: boolean) => void,
  setCurrentUser: (user: any) => void,
  setToken: (token: string) => void,
  navigate: (path: string) => void
) => {
  setDemoMode(true);
  
  showDemoModeNotification();
  
  setCurrentUser(MOCK_USER);
  
  const demoToken = "demo-token-" + Date.now();
  setToken(demoToken);
  localStorage.setItem("ecoCartToken", demoToken);
};

// Reset notification state
export const resetDemoModeNotification = () => {
  notificationState.resetNotificationState();
};
