
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

// Add a helper to check if a response is valid JSON
export const isJsonResponse = async (response: Response): Promise<boolean> => {
  const contentType = response.headers.get('content-type');
  return contentType && contentType.includes('application/json');
};

export const handleAuthError = (setToken: (token: string) => void, setCurrentUser: (user: any) => void) => {
  localStorage.removeItem("ecoCartToken");
  setToken("");
  setCurrentUser(null);
};

export const enableDemoMode = (
  setDemoMode: (value: boolean) => void,
  setCurrentUser: (user: any) => void,
  setToken: (token: string) => void,
  navigate: (path: string) => void
) => {
  setDemoMode(true);
  toast.info("Using demo mode - API connection failed");
  setCurrentUser(MOCK_USER);
  
  const demoToken = "demo-token-" + Date.now();
  setToken(demoToken);
  localStorage.setItem("ecoCartToken", demoToken);
};
