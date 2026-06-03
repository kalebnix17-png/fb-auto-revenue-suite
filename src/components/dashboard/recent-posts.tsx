import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, truncate } from "@/lib/utils";
import Link from "next/link";

const statusVariant: Record<string, any> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  PUBLISHED: "success",
  FAILED: "destructive",
};

export function RecentPosts({ posts }: { posts: any[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Posts</CardTitle>
        <Link href="/dashboard/posts" className="text-sm text-blue-600 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {posts.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            No posts yet. Create your first scheduled post!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="flex items-start justify-between px-6 py-3">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm text-gray-900 leading-snug">
                    {truncate(post.content, 80)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {post.page?.name} · {formatDate(post.createdAt)}
                  </p>
                </div>
                <Badge variant={statusVariant[post.status] ?? "secondary"}>
                  {post.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
