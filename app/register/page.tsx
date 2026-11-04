import { Suspense } from "react";
import Register from "@/src/components/auth/register/page";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f0f0]" />}>
      <Register />
    </Suspense>
  );
}
