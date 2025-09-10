"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSession } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        const sess = await getSession();
        const role = sess?.data?.role;
        if (role === "doctor") router.replace("/doctor");
        else if (role === "patient") router.replace("/patient");
        else router.replace("/login");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);
  return null;
}
