import { cookies } from 'next/headers';

/**
 * Reads the admin_session cookie and determines the admin role based on matching secrets.
 * @returns {'superadmin' | 'admin' | null}
 */
export async function getAdminRole() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;

  if (!session) return null;

  if (process.env.SUPER_ADMIN_API_SECRET && session === process.env.SUPER_ADMIN_API_SECRET) {
    return 'superadmin';
  }

  if (process.env.ADMIN_API_SECRET && session === process.env.ADMIN_API_SECRET) {
    return 'admin';
  }

  return null;
}
