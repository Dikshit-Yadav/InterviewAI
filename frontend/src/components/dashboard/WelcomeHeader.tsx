import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
export default function WelcomeHeader() {
  const name = JSON.parse(sessionStorage.getItem("name") ?? '"User"');
  const role = JSON.parse(sessionStorage.getItem("role") ?? '"Candidate"');
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center mb-8">
      
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {name}!
        </h1>
        <p className="text-gray-400">
          Targeting {role}
        </p>
      </div>

      <Button className="bg-gradient-to-r from-purple-500 to-indigo-500" onClick={()=>navigate("/interview")}>
        + Start new interview
      </Button>
    </div>
  );
}