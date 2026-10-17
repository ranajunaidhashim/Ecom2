import { getAdminRole } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';
import { isMaskPaidOrdersActive } from '@/lib/settings';

export const metadata = {
  title: 'Settings | Super Admin',
};

export default async function AdminSettingsPage() {
  const role = await getAdminRole();
  if (role !== 'superadmin') {
    redirect('/admin');
  }

  const initialMaskPaid = await isMaskPaidOrdersActive();
  return <SettingsClient initialMaskPaid={initialMaskPaid} />;
}
