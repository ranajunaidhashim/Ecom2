import AdminLayoutClient from './AdminLayoutClient';
import { getAdminRole } from '@/lib/admin-auth';

export default async function AdminLayout({ children }) {
  const role = await getAdminRole();
  return <AdminLayoutClient role={role}>{children}</AdminLayoutClient>;
}
