import { useEffect, useState } from "react";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { Navigate, Outlet } from "react-router-dom";
import { AuthService } from "@/services/authService";
import type { UserProfile } from "@/types/authType";

const ProtectedRoutes = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await AuthService.isme();

        if (data.isauthenticate && data.user) {
          sessionStorage.setItem("name", JSON.stringify(data.user.name));
          sessionStorage.setItem("role", JSON.stringify(data.user.targetRole));
          sessionStorage.setItem("email", JSON.stringify(data.user.email));
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

  if (loading) return <PageSkeleton page="auth" />;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;