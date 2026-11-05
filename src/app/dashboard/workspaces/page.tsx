import { requireAuth } from '@/lib/auth-guard';
import WorkspacesView from './workspaces-view';

export default async function Page() {
  await requireAuth();
  return <WorkspacesView />;
}
