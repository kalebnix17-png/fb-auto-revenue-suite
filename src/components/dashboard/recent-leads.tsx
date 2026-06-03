import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const statusVariant: Record<string, any> = {
  NEW: "default",
  CONTACTED: "secondary",
  QUALIFIED: "warning",
  CONVERTED: "success",
  LOST: "destructive",
};

export function RecentLeads({ leads }: { leads: any[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Leads</CardTitle>
        <Link href="/dashboard/leads" className="text-sm text-blue-600 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {leads.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            No leads yet. Connect your Facebook Pages to start capturing leads.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">
                      {lead.email ?? lead.phone ?? lead.source ?? "No contact info"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[lead.status] ?? "secondary"}>
                    {lead.status}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatDate(lead.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
