import { ActionFeedback } from "@/components/ui/action-feedback";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 lg:px-8">{children}</main>
      <ActionFeedback />
    </div>
  );
}
