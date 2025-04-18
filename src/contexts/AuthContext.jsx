
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

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:5000/api/users/verify", {
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
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Registration successful! Please log in.");
      navigate("/login");
      return true;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

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
      setError(error.message);
      toast.error(error.message);
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
