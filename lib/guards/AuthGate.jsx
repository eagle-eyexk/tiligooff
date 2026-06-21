import { useAuth } from "@/lib/AuthContext";
import { Navigate } from "react-router-dom";

export default function AuthGate({ children }) {
  const { status } = useAuth();

  // ONLY global boot blocking
  if (status === "BOOTING") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png"
            className="h-16 animate-pulse"
          />
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return children;
}
