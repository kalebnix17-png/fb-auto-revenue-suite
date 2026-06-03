import { Header } from "@/components/layout/header";
import { PostsClient } from "@/components/posts/posts-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return (
    <div>
      <Header
        title="Posts"
        subtitle="Schedule and manage your Facebook posts"
      />
      <div className="p-6">
        <PostsClient />
      </div>
    </div>
  );
}
