import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectRoutes from "./components/ProtectRoutes";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewPage from "./pages/InterviewPage";
import SessionPage from "./pages/SessionPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        <Route element={<ProtectRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/interview/session" element={<SessionPage />} />
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;