"use client";

import { KeyRound, Save, UserCircle } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/status";
import { useAuth } from "@/contexts/auth-context";
import { useFinance } from "@/hooks/use-finance";
import { initials } from "@/lib/utils";

const currencies = [
  { code: "PKR", label: "PKR — Pakistani Rupee" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "INR", label: "INR — Indian Rupee" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const finance = useFinance(user?.uid);
  const [currency, setCurrency] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const selectedCurrency = currency ?? finance.settings.currency;

  if (finance.loading) return <LoadingState />;

  const handleSave = async () => {
    setSaving(true);
    try {
      await finance.saveSettings({ ...finance.settings, currency: selectedCurrency });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid max-w-3xl gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Settings and profile</h2>
        <p className="mt-1 text-sm text-muted">
          Manage display preferences and account details.
        </p>
      </div>

      {finance.error ? (
        <Alert title="Could not load settings">
          {finance.error}
        </Alert>
      ) : null}

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-primary text-xl font-black text-primary-foreground shadow-sm"
            aria-hidden="true"
          >
            {initials(user?.displayName, user?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {user?.displayName || "RozNaamcha user"}
            </p>
            <p className="truncate text-sm text-muted">{user?.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <UserCircle className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
              <p className="text-xs text-muted">
                Signed in via{" "}
                {user?.providerData?.[0]?.providerId === "google.com"
                  ? "Google"
                  : "Email / Password"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="Display currency">
            <Select
              value={selectedCurrency}
              onChange={(event) => setCurrency(event.target.value)}
              aria-label="Select currency"
            >
              {currencies.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button onClick={handleSave} disabled={saving} aria-label="Save preferences">
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Account security card */}
      <Card>
        <CardHeader>
          <CardTitle>Account security</CardTitle>
        </CardHeader>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 rounded-lg bg-panel-soft p-4">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Data isolation</p>
              <p className="mt-1 text-xs text-muted">
                Your transactions, budgets, and settings are stored in your personal
                Firebase subcollection. No other user can read or write your data.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-panel-soft p-4">
            <UserCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Session persistence</p>
              <p className="mt-1 text-xs text-muted">
                You stay signed in across browser sessions using Firebase local
                persistence. Sign out at any time from the sidebar.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
