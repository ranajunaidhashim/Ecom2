import BillingClient from './BillingClient';
import { getAdminRole } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export default async function AdminBillingPage() {
  const role = await getAdminRole();
  if (role !== 'superadmin') {
    redirect('/admin');
  }

  return <BillingClient />;
}
