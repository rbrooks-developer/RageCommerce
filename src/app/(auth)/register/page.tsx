"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(register, null) as [
    { error?: Record<string, string[]>; success?: boolean } | null,
    (payload: FormData) => void,
    boolean
  ];

  const errors = (state as { error?: Record<string, string[]> } | null)?.error;
  const success = (state as { success?: boolean } | null)?.success;

  if (success) {
    return (
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="text-gray-500 text-sm">
          We sent a confirmation link to your email. Click it to activate your account, then{" "}
          <Link href="/login" className="text-gray-900 underline underline-offset-2">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 underline underline-offset-2">Sign in</Link>
        </p>
      </div>

      <form action={action} className="space-y-4">
        {errors?._form && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errors._form[0]}
          </div>
        )}

        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" error={errors?.email?.[0]} required />
        </div>

        <div>
          <Label htmlFor="password" required>Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" error={errors?.password?.[0]} required />
          <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isPending}>
          Create account
        </Button>
      </form>
    </div>
  );
}
