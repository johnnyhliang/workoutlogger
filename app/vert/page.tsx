import { VertPanel } from '../components/VertPanel';
import { getVertLog } from '@/db/queries';

export const dynamic = 'force-dynamic';

export default async function VertPage() {
  const entries = await getVertLog(60);
  return <VertPanel initial={entries} />;
}
