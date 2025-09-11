import React from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function FormSection({ title, description, children, actions }: FormSectionProps) {
  return (
    <div className="rounded-2xl border p-4 md:p-6 shadow-sm bg-white dark:bg-zinc-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
      {actions && <div className="mt-4 flex gap-2 justify-end">{actions}</div>}
    </div>
  );
}
