import { notFound } from "next/navigation";

import { hasRoleAtLeast } from "@/lib/admin/roles";
import { getAdminUser } from "@/lib/supabase/admin";

import { ResumeAdmin } from "./ResumeAdmin";

export default async function ResumeAdminPage() {
  const { role } = await getAdminUser();
  if (!role || !hasRoleAtLeast(role, "editor")) {
    notFound();
  }
  return <ResumeAdmin />;
}
