
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, handleAuthError, enableDemoMode } from "../utils/authUtils";
import { useAuthOperations } from "../hooks/useAuthOperations";

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

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
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
            handleAuthError(setToken, setCurrentUser);
          }
        } catch (error) {
          console.error("Error checking auth state:", error);
          handleAuthError(setToken, setCurrentUser);
          
          if (error.name === "AbortError" || error.name === "TypeError") {
            enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
          }
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("ecoCartToken", token);
    } else {
      localStorage.removeItem("ecoCartToken");
    }
  }, [token]);

  const { register, login, logout } = useAuthOperations(
    setError,
    setToken,
    setCurrentUser,
    setDemoMode,
    navigate
  );

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!currentUser,
    demoMode,
    enableDemoMode: () => enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

