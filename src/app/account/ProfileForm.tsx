"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string;
}

export function ProfileForm({ firstName, lastName, phone, email }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateProfile, null) as [
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
          Profile updated.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name" required>First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={firstName ?? ""}
            error={errors?.first_name?.[0]}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name" required>Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={lastName ?? ""}
            error={errors?.last_name?.[0]}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="profile_email">Email</Label>
        <Input
          id="profile_email"
          value={email}
          disabled
          className="cursor-not-allowed"
          style={{ opacity: 0.5 }}
        />
        <p className="mt-1 text-xs" style={{ opacity: 0.45 }}>Email cannot be changed here.</p>
      </div>

      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(555) 123-4567"
          defaultValue={phone ?? ""}
        />
      </div>

      <div>
        <Button type="submit" loading={isPending} className="font-semibold" style={{ backgroundColor: "var(--site-fg)", color: "var(--site-bg)", fontFamily: "inherit" }}>Save Profile</Button>
      </div>
    </form>
  );
}
