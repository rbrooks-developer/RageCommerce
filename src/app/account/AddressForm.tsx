"use client";

import { useActionState, useEffect } from "react";
import { saveAddress } from "@/lib/actions/addresses";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { UserAddress } from "@/types";

interface AddressFormProps {
  address?: UserAddress | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddressForm({ address, onClose, onSuccess }: AddressFormProps) {
  const [state, action, isPending] = useActionState(saveAddress, null) as [
    { error?: Record<string, string[]>; success?: boolean } | null,
    (payload: FormData) => void,
    boolean
  ];
  const errors = state?.error;

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state?.success, onSuccess]);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {address ? "Edit Address" : "Add New Address"}
      </h3>

      <form action={action} className="space-y-4">
        {address && <input type="hidden" name="address_id" value={address.id} />}

        {errors?._form && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errors._form[0]}
          </div>
        )}

        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            name="label"
            placeholder="Home, Work, etc."
            defaultValue={address?.label ?? "Home"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name" required>First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={address?.first_name ?? ""}
              error={errors?.first_name?.[0]}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name" required>Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={address?.last_name ?? ""}
              error={errors?.last_name?.[0]}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company">Company (optional)</Label>
          <Input
            id="company"
            name="company"
            defaultValue={address?.company ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="address_line1" required>Address</Label>
          <Input
            id="address_line1"
            name="address_line1"
            placeholder="123 Main St"
            defaultValue={address?.address_line1 ?? ""}
            error={errors?.address_line1?.[0]}
            required
          />
        </div>

        <div>
          <Label htmlFor="address_line2">Apartment, suite, etc. (optional)</Label>
          <Input
            id="address_line2"
            name="address_line2"
            placeholder="Apt 4B"
            defaultValue={address?.address_line2 ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="city" required>City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={address?.city ?? ""}
              error={errors?.city?.[0]}
              required
            />
          </div>
          <div>
            <Label htmlFor="state" required>State</Label>
            <Input
              id="state"
              name="state"
              placeholder="NY"
              maxLength={2}
              defaultValue={address?.state ?? ""}
              error={errors?.state?.[0]}
              required
            />
          </div>
          <div>
            <Label htmlFor="zip" required>ZIP</Label>
            <Input
              id="zip"
              name="zip"
              placeholder="10001"
              defaultValue={address?.zip ?? ""}
              error={errors?.zip?.[0]}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(555) 123-4567"
            defaultValue={address?.phone ?? ""}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" loading={isPending}>
            {address ? "Save Changes" : "Add Address"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
