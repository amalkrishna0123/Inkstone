import { Suspense } from "react";
import Login from "@/src/components/auth/login/page";

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Login />
    </Suspense>
  );
};

export default LoginPage;
