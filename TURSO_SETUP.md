# Turso Setup (do this first, ~5 min)

## 1. Create account

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Restart shell or source profile
source ~/.bashrc  # or ~/.zshrc

# Sign up (opens browser)
turso auth signup
```

If you already have a GitHub account it's one click.

## 2. Create the database

```bash
turso db create lift-tracker

# Get the connection URL
turso db show lift-tracker --url
# Copy this — you'll need it as TURSO_DATABASE_URL

# Create an auth token
turso db tokens create lift-tracker
# Copy this — you'll need it as TURSO_AUTH_TOKEN
```

## 3. Save credentials

Create a file `secrets.txt` somewhere safe (NOT in your repo):

```
TURSO_DATABASE_URL=libsql://lift-tracker-johnnyhliang.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...long_token_here
```

You'll paste these into Vercel's environment variables later, and into your local `.env.local` file when building.

## 4. Test the connection (optional)

```bash
turso db shell lift-tracker
> SELECT 1;
> .quit
```

If that works, you're set. Hand the SPEC.md to Claude Code and it will handle schema creation, queries, everything else.

## Notes

- Free tier: 9GB storage, 1B row reads/month, 25M row writes/month. You'll use <0.01%.
- Turso = SQLite over HTTP. Same SQL syntax you already know.
- If you ever want to inspect data: `turso db shell lift-tracker` then write SQL.
- To reset the database: `turso db destroy lift-tracker` then recreate.
