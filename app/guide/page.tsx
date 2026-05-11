import { db } from '@/db/client';
import { guideContent } from '@/db/schema';
import { DEFAULT_GUIDE_MARKDOWN } from '@/lib/guide-default';
import { GuideEditor } from '../components/GuideEditor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Guide · Lift Tracker',
};

export default async function GuidePage() {
  const rows = await db.select().from(guideContent).limit(1);
  const content = rows[0]?.content ?? DEFAULT_GUIDE_MARKDOWN;

  return <GuideEditor initial={content} />;
}
