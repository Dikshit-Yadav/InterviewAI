import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectRoutes from "./components/ProtectRoutes";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewPage from "./pages/InterviewPage";
import SessionPage from "./pages/SessionPage";
import ReportPage from "./pages/ReportPage";
import Profile from "./pages/Profile";
import SharedInterviewBuilder from "./pages/SharedInterviewBuilder";
import SharedInterviewJoin from "./pages/SharedInterviewJoin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Protected routes: Must be logged in to access */}
        <Route element={<ProtectRoutes />}>
          <Route path="/join/:token" element={<SharedInterviewJoin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/interview/:interviewId" element={<SessionPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shared-interviews" element={<SharedInterviewBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
