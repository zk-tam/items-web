import { Suspense } from "react";
import { AdminNavigationProgress } from "@/components/admin/AdminNavigationProgress";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><Suspense fallback={null}><AdminNavigationProgress /></Suspense>{children}</>;
}
