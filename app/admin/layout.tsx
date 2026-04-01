import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { getAdminUser } from "@/lib/supabase/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, role } = await getAdminUser();

  if (!user) {
    return <div className="min-h-screen px-6 py-8">{children}</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold">Access denied</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Your account does not have admin permissions yet. Add your user ID to the
          <code className="mx-1 rounded bg-muted px-2 py-0.5 text-sm">app_admins</code> table
          in Supabase to enable access.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminTopBar email={user.email} role={role} />
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
