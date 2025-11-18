import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const processAuth = async () => {
      try {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          setStatus("Authentication failed. Redirecting...");
          setTimeout(() => navigate("/login?error=authentication_failed"), 1000);
          return;
        }

        if (token) {
          setStatus("Verifying authentication...");
          
          // Verify the token with backend (cookie is already set by server)
          try {
            const response = await axios.get("https://optimizalphabackend.onrender.com/api/verifyuser", {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.data.Status === "Success") {
              setStatus("Success! Redirecting...");
              // Give time for cookie to be properly set
              await new Promise(resolve => setTimeout(resolve, 200));
              navigate("/dashboard");
            } else {
              setStatus("Verification failed. Redirecting...");
              await new Promise(resolve => setTimeout(resolve, 1000));
              navigate("/login?error=verification_failed");
            }
          } catch (verifyError) {
            console.error("Token verification failed:", verifyError);
            // Even if verify fails, try to navigate - the cookie might still work
            setStatus("Redirecting...");
            await new Promise(resolve => setTimeout(resolve, 200));
            navigate("/dashboard");
          }
        } else {
          setStatus("No token found. Redirecting...");
          setTimeout(() => navigate("/login?error=no_token"), 1000);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("Error occurred. Redirecting...");
        setTimeout(() => navigate("/login?error=callback_failed"), 1000);
      }
    };

    processAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f111a]">
      <div className="text-white text-xl mb-4">{status}</div>
      <div className="w-12 h-12 border-4 border-[#26c6da] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

