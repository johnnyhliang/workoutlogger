import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env.local' });

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const res = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name",
  );

  console.log('Tables in Turso:');
  for (const row of res.rows) console.log('  -', row.name);

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
