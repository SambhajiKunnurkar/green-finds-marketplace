
import { toast } from "sonner";
import { API_BASE_URL, enableDemoMode, isJsonResponse, resetDemoModeNotification } from "../utils/authUtils";

export const useAuthOperations = (
  setError: (error: string) => void,
  setToken: (token: string) => void,
  setCurrentUser: (user: any) => void,
  setDemoMode: (value: boolean) => void,
  navigate: (path: string) => void
) => {
  const register = async (name: string, email: string, password: string) => {
    try {
      setError("");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.error("Registration request timed out. Using demo mode.");
        enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
        navigate("/");
        return true;
      }, 5000);

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Check if response is HTML instead of JSON
      const isJson = await isJsonResponse(response);
      if (!isJson) {
        console.error("Received HTML instead of JSON. Using demo mode.");
        toast.error("API returned HTML instead of JSON. Using demo mode.");
        enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
        navigate("/");
        return true;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Registration failed";
        
        if (response.status === 404) {
          toast.error("API not available. Using demo mode.");
          enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
          navigate("/");
          return true;
        }
        
        throw new Error(errorMessage);
      }
      
      toast.success("Registration successful! Please log in.");
      navigate("/login");
      return true;
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "TypeError" || error.name === "SyntaxError" || error.message.includes("Failed to fetch")) {
        toast.error("Unable to connect to server. Using demo mode.");
        enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
        navigate("/");
        return true;
      }
      
      setError(error.message || "Registration failed. Please try again.");
      toast.error(error.message || "Registration failed. Please try again.");
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError("");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.error("Login request timed out. Using demo mode.");
        enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
        navigate("/");
        return true;
      }, 5000);

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Check if response is HTML instead of JSON
      const isJson = await isJsonResponse(response);
      if (!isJson) {
        console.error("Received HTML instead of JSON. Using demo mode.");
        toast.error("API returned HTML instead of JSON. Using demo mode.");
        enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
        navigate("/");
        return true;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Login failed";
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setToken(data.token);
      setCurrentUser(data.user);
      setDemoMode(false);
      toast.success("Login successful!");
      navigate("/");
      return true;
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "TypeError" || error.name === "SyntaxError" || error.message.includes("Failed to fetch")) {
        toast.error("Unable to connect to server. Using demo mode.");
        enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
        navigate("/");
        return true;
      }
      
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken("");
    setDemoMode(false);
    localStorage.removeItem("ecoCartToken");
    // Reset the demo mode notification flag when logging out
    resetDemoModeNotification();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return { register, login, logout };
};
