import { useEffect, useState } from "react";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthService } from "@/services/authService";
import type { UserProfile } from "@/types/authType";

const ProtectedRoutes = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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

  if (!user) {
    const targetPath = location.pathname + location.search;
    sessionStorage.setItem("auth_redirect", targetPath);
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(targetPath)}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoutes;
