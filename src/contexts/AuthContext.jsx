
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mock user data for demo/fallback mode
const MOCK_USER = {
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

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("ecoCartToken") || "");
  const [demoMode, setDemoMode] = useState(false);
  const navigate = useNavigate();

  // Define the API base URL - use relative URL for proxy
  const API_BASE_URL = "/api";

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          // Set timeout to prevent long-running requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${API_BASE_URL}/users/verify`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
            setDemoMode(false);
          } else {
            // Token invalid or expired
            handleAuthError();
          }
        } catch (error) {
          console.error("Error checking auth state:", error);
          handleAuthError();
          
          // If we can't connect to the server, use demo mode
          if (error.name === "AbortError" || error.name === "TypeError") {
            enableDemoMode();
          }
        }
      }
      setLoading(false);
    };

    const handleAuthError = () => {
      localStorage.removeItem("ecoCartToken");
      setToken("");
      setCurrentUser(null);
    };

    const enableDemoMode = () => {
      setDemoMode(true);
      toast.info("Using demo mode - API connection failed");
      setCurrentUser(MOCK_USER);
      
      // Create a demo token for demo mode
      const demoToken = "demo-token-" + Date.now();
      setToken(demoToken);
      localStorage.setItem("ecoCartToken", demoToken);
    };

    checkLoggedIn();
  }, [token]);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("ecoCartToken", token);
    } else {
      localStorage.removeItem("ecoCartToken");
    }
  }, [token]);

  const register = async (name, email, password) => {
    try {
      // Set timeout to prevent long-running requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.error("Registration request timed out. Using demo mode.");
        enableDemoMode();
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
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(data.message || "Registration failed");
      }
      
      const data = await response.json();
      toast.success("Registration successful! Please log in.");
      navigate("/login");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle network errors by enabling demo mode
      if (error.name === "AbortError" || error.name === "TypeError") {
        enableDemoMode();
        navigate("/");
        return true;
      }
      
      setError(error.message || "Registration failed. Please try again.");
      toast.error(error.message || "Registration failed. Please try again.");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.error("Login request timed out. Using demo mode.");
        enableDemoMode();
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
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "Login failed" }));
        throw new Error(data.message || "Login failed");
      }
      
      const data = await response.json();
      setToken(data.token);
      setCurrentUser(data.user);
      setDemoMode(false);
      toast.success("Login successful!");
      navigate("/");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle network errors by enabling demo mode
      if (error.name === "AbortError" || error.name === "TypeError") {
        enableDemoMode();
        navigate("/");
        return true;
      }
      
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed. Please try again.");
      return false;
    }
  };

  const enableDemoMode = () => {
    setDemoMode(true);
    toast.info("Using demo mode - API connection failed");
    setCurrentUser(MOCK_USER);
    
    // Create a demo token for demo mode
    const demoToken = "demo-token-" + Date.now();
    setToken(demoToken);
    localStorage.setItem("ecoCartToken", demoToken);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken("");
    setDemoMode(false);
    localStorage.removeItem("ecoCartToken");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!currentUser,
    demoMode,
    enableDemoMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
