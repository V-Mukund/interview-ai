"use client";

import { useQuery } from "@tanstack/react-query";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://interview-ai-production-517f.up.railway.app';

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