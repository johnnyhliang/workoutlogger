import { WeightPanel } from '../components/WeightForm';
import { getBodyLog } from '@/db/queries';

export const dynamic = 'force-dynamic';

export default async function WeightPage() {
  const entries = await getBodyLog(60);
  return <WeightPanel initial={entries} />;
}
