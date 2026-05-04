import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthService } from "@/services/authService";

const ProtectedRoutes = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchMe = async () => {
    try {
      const data = await AuthService.isme();
      sessionStorage.setItem("name", JSON.stringify(data.user.name));
      sessionStorage.setItem("role", JSON.stringify(data.user.targetRole));
      sessionStorage.setItem("email", JSON.stringify(data.user.email));
      console.log(data);
      if (data.isauthenticate) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchMe();
}, []);

  if (loading) return <div>Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;