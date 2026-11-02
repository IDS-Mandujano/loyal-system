import { redirect } from 'next/navigation';

export default function LegacyManagementRedirect() {
  redirect('/admin/management');
}
