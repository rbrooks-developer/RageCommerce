"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { slugify, cn } from "@/lib/utils";
import type { Category } from "@/types";

type Option = { id: string; label: string; depth: number };

function buildOptions(categories: Category[], excludeId?: string): Option[] {
  const topIds = new Set(categories.filter((c) => !c.parent_id).map((c) => c.id));

  const options: Option[] = [{ id: "", label: "None (top level)", depth: 0 }];

  const top = categories.filter((c) => !c.parent_id && c.id !== excludeId);
  for (const parent of top) {
    options.push({ id: parent.id, label: parent.name, depth: 0 });
    const level2 = categories.filter(
      (c) => c.parent_id === parent.id && c.id !== excludeId
    );
    for (const child of level2) {
      options.push({ id: child.id, label: child.name, depth: 1 });
      // Level-2 children can also be parents (creating level 3)
      // Level-3 categories are NOT offered as parents — that would exceed 3 levels
    }
  }

  return options;
}

function CategorySelect({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name="parent_id" value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        <span className="text-gray-900">
          {selected.depth === 1 ? `— ${selected.label}` : selected.label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.id || "__none__"}
              type="button"
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-1 py-2 text-sm text-left transition-colors",
                opt.depth === 1 ? "pl-8" : "pl-3",
                opt.id === value
                  ? "bg-gray-900 text-white"
                  : opt.depth === 1
                  ? "text-gray-600 hover:bg-gray-50"
                  : "text-gray-900 hover:bg-gray-50"
              )}
            >
              {opt.depth === 1 && (
                <span className={opt.id === value ? "text-gray-400" : "text-gray-400"}>
                  —
                </span>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const options = buildOptions(categories, defaultValues?.id);

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
        <Label htmlFor="parent_id">Parent Category</Label>
        <CategorySelect options={options} value={parentId} onChange={setParentId} />
      </div>

      <Button type="submit" loading={isPending}>{submitLabel}</Button>
    </form>
  );
}
