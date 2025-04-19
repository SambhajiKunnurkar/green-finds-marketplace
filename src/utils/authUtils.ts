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
export const API_BASE_URL = "/api";

// Add a flag to track if demo mode notification has been shown
let demoModeNotificationShown = false;

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

// Add a more controlled demo mode notification mechanism
export const showDemoModeNotification = (() => {
  let notificationShown = false;
  return () => {
    if (!notificationShown) {
      toast.info("Using demo mode - API connection failed", {
        duration: 5000,
        id: "demo-mode-notification",
        onAutoClose: () => {
          notificationShown = false;
        }
      });
      notificationShown = true;
    }
  };
})();

export const enableDemoMode = (
  setDemoMode: (value: boolean) => void,
  setCurrentUser: (user: any) => void,
  setToken: (token: string) => void,
  navigate: (path: string) => void
) => {
  setDemoMode(true);
  
  // Use the new controlled notification mechanism
  showDemoModeNotification();
  
  setCurrentUser(MOCK_USER);
  
  const demoToken = "demo-token-" + Date.now();
  setToken(demoToken);
  localStorage.setItem("ecoCartToken", demoToken);
};

// Modify reset to reset the notification state
export const resetDemoModeNotification = () => {
  // Reset the closure's internal state
  showDemoModeNotification = (() => {
    let notificationShown = false;
    return () => {
      if (!notificationShown) {
        toast.info("Using demo mode - API connection failed", {
          duration: 5000,
          id: "demo-mode-notification",
          onAutoClose: () => {
            notificationShown = false;
          }
        });
        notificationShown = true;
      }
    };
  })();
};
