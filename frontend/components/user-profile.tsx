"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../lib/config";

const baseUrl = API_BASE_URL;

export default function ProfilePage() {
  const userId = "123";

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () =>
      fetch(`${baseUrl}/users/${userId}`).then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <p>Loading profile...</p>;

  return (
    <main>
      <h1>User Profile</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </main>
  );
}