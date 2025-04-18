
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("ecoCartToken") || "");
  const navigate = useNavigate();

  // Define the API base URL - use relative URL for proxy
  const API_BASE_URL = "/api";

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/verify`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
          } else {
            // Token invalid or expired
            localStorage.removeItem("ecoCartToken");
            setToken("");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error checking auth state:", error);
          setCurrentUser(null);
          localStorage.removeItem("ecoCartToken");
          setToken("");
        }
      }
      setLoading(false);
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
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Registration successful! Please log in.");
      navigate("/login");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
      toast.error(error.message || "Registration failed. Please try again.");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setToken(data.token);
      setCurrentUser(data.user);
      toast.success("Login successful!");
      navigate("/");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken("");
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
