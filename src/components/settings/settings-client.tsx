"use client";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { User, Lock, Bell, Shield } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function SettingsClient() {
  const qc = useQueryClient();
  const { addToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => axios.get("/api/user/profile").then((r) => r.data),
  });

  const user = data?.user;

  const [profile, setProfile] = React.useState({ name: "", image: "" });
  const [passwords, setPasswords] = React.useState({ current: "", newPass: "", confirm: "" });
  const [notifSettings, setNotifSettings] = React.useState({
    emailLeads: true,
    emailBilling: true,
    emailPosts: false,
  });

  React.useEffect(() => {
    if (user) {
      setProfile({ name: user.name ?? "", image: user.image ?? "" });
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (body: any) => axios.patch("/api/user/profile", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      addToast("Profile updated!", "success");
    },
    onError: () => addToast("Failed to update profile", "error"),
  });

  const changePassword = useMutation({
    mutationFn: (body: any) => axios.patch("/api/user/password", body),
    onSuccess: () => {
      setPasswords({ current: "", newPass: "", confirm: "" });
      addToast("Password changed successfully!", "success");
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.error ?? "Failed to change password", "error");
    },
  });

  const handlePasswordSubmit = () => {
    if (!passwords.current || !passwords.newPass) {
      addToast("Please fill all password fields", "error");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      addToast("New passwords do not match", "error");
      return;
    }
    if (passwords.newPass.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    changePassword.mutate({ currentPassword: passwords.current, newPassword: passwords.newPass });
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(user?.name ?? "U")
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role?.toLowerCase()} account</p>
            </div>
          </div>

          <Input
            placeholder="Display name"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            placeholder="Profile picture URL (optional)"
            value={profile.image}
            onChange={(e) => setProfile((p) => ({ ...p, image: e.target.value }))}
          />
          <Button
            onClick={() => updateProfile.mutate({ name: profile.name, image: profile.image || null })}
            loading={updateProfile.isPending}
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.password ? (
            <>
              <Input
                type="password"
                placeholder="Current password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="New password (min. 8 characters)"
                value={passwords.newPass}
                onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              />
              <Button onClick={handlePasswordSubmit} loading={changePassword.isPending}>
                Update Password
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <span>You signed in with Facebook. Password changes are managed through your Facebook account.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "emailLeads", label: "New lead notifications", desc: "Get an email when a new lead is captured" },
            { key: "emailBilling", label: "Billing notifications", desc: "Payment receipts and subscription updates" },
            { key: "emailPosts", label: "Post publishing updates", desc: "Get notified when posts are published or fail" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <button
                onClick={() => setNotifSettings((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifSettings[key as keyof typeof notifSettings]
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    notifSettings[key as keyof typeof notifSettings] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400">
            Note: Notification preferences will be saved to your profile in a future update.
          </p>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => addToast("Please contact support to delete your account", "info")}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
