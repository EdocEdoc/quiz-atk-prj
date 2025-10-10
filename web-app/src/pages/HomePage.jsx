import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { Plus, Users, Zap } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthContext } from "../contexts/AuthContext";

function HomePage() {
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    logout,
  } = useAuthContext();

  useEffect(() => {
    console.log("🚀 ~ HomePage ~ user:", user);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Attack</h1>
            <p className="text-gray-300">
              Challenge friends in AI-powered quiz battles!
            </p>
          </div>
          <Button
            onClick={() => {
              // Implement Google Sign-In logic here
              signInWithGoogle();
            }}
            className="w-full bg-white hover:bg-gray-100 p-50 flex items-center justify-center h-12"
          >
            <h3 className="text-gray-900 font-bold ">Sign in with Google</h3>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1>HomePage</h1>
      <Button
        onClick={() => {
          // Implement Google Sign-In logic here
          logout();
        }}
        className="w-full bg-white hover:bg-gray-100 p-50 flex items-center justify-center h-12"
      >
        <h3 className="text-gray-900 font-bold ">LOGOUT</h3>
      </Button>
    </div>
  );
}

export default HomePage;
