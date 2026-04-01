import { notFound } from "next/navigation";

import { hasRoleAtLeast } from "@/lib/admin/roles";
import { getAdminUser } from "@/lib/supabase/admin";

import { BlogAdmin } from "./BlogAdmin";

export default async function BlogAdminPage() {
  const { role } = await getAdminUser();
  if (!role || !hasRoleAtLeast(role, "editor")) {
    notFound();
  }
  return <BlogAdmin />;
}
