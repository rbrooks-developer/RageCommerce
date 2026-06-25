"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  const [state, action, isPending] = useActionState(changePassword, null) as [
    { error?: Record<string, string[]>; success?: boolean } | null,
    (payload: FormData) => void,
    boolean
  ];
  const errors = state?.error;

  return (
    <form action={action} className="space-y-4">
      {errors?._form && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errors._form[0]}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          Password updated successfully.
        </div>
      )}

      <div>
        <Label htmlFor="password" required>New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={errors?.password?.[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirm_password" required>Confirm Password</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          error={errors?.confirm_password?.[0]}
          required
        />
      </div>

      <Button type="submit" loading={isPending} style={{ backgroundColor: "var(--site-fg)", color: "var(--site-bg)" }}>Update Password</Button>
    </form>
  );
}
