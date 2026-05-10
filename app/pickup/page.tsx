import { PickupPanel } from '../components/PickupPanel';
import { getPickupLog } from '@/db/queries';

export const dynamic = 'force-dynamic';

export default async function PickupPage() {
  const entries = await getPickupLog(60);
  return <PickupPanel initial={entries} />;
}
