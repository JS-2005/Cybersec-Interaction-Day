"use client"
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  const supabase = createClient();

  useEffect(() => {
    // Get Claims
    const getClaims = async () => {

      // Get Supabase Claims
      const { data } = await supabase.auth.getClaims();
      const userClaims = data?.claims;

      if (userClaims) {
        // Redirect to home
        redirect("/profile")

      } else {
        // Redirect to login
        redirect("/login")

      }
    }
    getClaims();
  }, [])
}
