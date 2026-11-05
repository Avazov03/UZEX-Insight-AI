import { requireAuth } from '@/lib/auth-guard';
import ProfileViewPage from '@/features/profile/components/profile-view-page';

export const metadata = {
  title: 'Profile'
};

export default async function Page() {
  await requireAuth();

  return <ProfileViewPage />;
}
