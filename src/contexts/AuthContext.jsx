import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, handleAuthError, enableDemoMode, isJsonResponse } from "../utils/authUtils";
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [lastVerificationAttempt, setLastVerificationAttempt] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const now = Date.now();
      if (now - lastVerificationAttempt < 10000 && (demoMode || isCheckingAuth || !token)) {
        return;
      }
      setLastVerificationAttempt(now);

      if (demoMode || isCheckingAuth || !token) {
        setLoading(false);
        return;
      }

      setIsCheckingAuth(true);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        console.log("Verifying token...");
        const response = await fetch(`${API_BASE_URL}/users/verify`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log("Token verification failed with status:", response.status);
          handleAuthError(setToken, setCurrentUser);
          
          if (response.status === 404) {
            console.log("API endpoint not found, enabling demo mode");
            enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
          }
          setLoading(false);
          setIsCheckingAuth(false);
          return;
        }
        
        const isJson = await isJsonResponse(response);
        if (!isJson) {
          console.error("Received HTML instead of JSON during token verification");
          handleAuthError(setToken, setCurrentUser);
          enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
          setLoading(false);
          setIsCheckingAuth(false);
          return;
        }

        const data = await response.json();
        setCurrentUser(data.user);
        setDemoMode(false);
      } catch (error) {
        console.error("Error checking auth state:", error);
        handleAuthError(setToken, setCurrentUser);
        
        if (error.name === "AbortError" || error.name === "TypeError" || error.name === "SyntaxError") {
          console.log("Network or parsing error, enabling demo mode");
          enableDemoMode(setDemoMode, setCurrentUser, setToken, navigate);
        }
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    checkLoggedIn();
  }, [token, navigate, demoMode]);

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
