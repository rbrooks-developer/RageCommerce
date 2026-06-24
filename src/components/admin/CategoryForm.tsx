"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { CategorySelect, buildCategoryOptions } from "./CategorySelect";
import type { Category } from "@/types";

interface CategoryFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<unknown>;
  categories: Category[];
  defaultValues?: Partial<Category>;
  submitLabel?: string;
}

export function CategoryForm({
  action,
  categories,
  defaultValues,
  submitLabel = "Save Category",
}: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, null) as [
    { error?: Record<string, string[]> } | null,
    (payload: FormData) => void,
    boolean
  ];

  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const [parentId, setParentId] = useState(defaultValues?.parent_id ?? "");

  useEffect(() => {
    const input = nameRef.current;
    if (!input) return;
    const handler = () => {
      if (slugRef.current && !defaultValues?.slug) {
        slugRef.current.value = slugify(input.value);
      }
    };
    input.addEventListener("input", handler);
    return () => input.removeEventListener("input", handler);
  }, [defaultValues?.slug]);

  const errors = (state as { error?: Record<string, string[]> } | null)?.error;

  // Only depth 0 and 1 can be parents — selecting them creates depth 1 or 2 children,
  // and depth-2 children can themselves be parents to reach the 3-level maximum.
  const options = buildCategoryOptions(categories, {
    noneLabel: "None (top level)",
    excludeId: defaultValues?.id,
    maxDepth: 1,
  });

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {errors?._form && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errors._form[0]}
        </div>
      )}

      <div>
        <Label htmlFor="name" required>Name</Label>
        <Input
          ref={nameRef}
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="e.g. Clothing"
          error={errors?.name?.[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="slug" required>Slug</Label>
        <Input
          ref={slugRef}
          id="slug"
          name="slug"
          defaultValue={defaultValues?.slug}
          placeholder="e.g. clothing"
          error={errors?.slug?.[0]}
          required
        />
        <p className="mt-1 text-xs text-gray-500">Used in URLs. Lowercase letters, numbers, and hyphens only.</p>
      </div>

      <div>
        <Label>Parent Category</Label>
        <CategorySelect
          options={options}
          value={parentId}
          onChange={setParentId}
          inputName="parent_id"
        />
      </div>

      <Button type="submit" loading={isPending}>{submitLabel}</Button>
    </form>
  );
}
