import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


export default function FinalCTA() {
    const navigate = useNavigate();
  return (
    <section className="px-8 py-20">
      <div className="max-w-5xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600">
        
        <div className="text-3xl font-bold mb-4">
          Ready to interview like a pro?
        </div>

        <p className="text-purple-100 mb-6">
          Start your first mock interview now — no credit card, no setup.
        </p>

        <Button className="bg-black text-white hover:bg-gray-900" onClick={() => navigate("/signup")}>
          Start free →
        </Button>
      </div>
    </section>
  );
}