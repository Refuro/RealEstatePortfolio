# Shell command risk policy

This policy is implemented by the **beforeShellExecution** hook in `.cursor/hooks.json`. Keep the hook prompt in sync with this document when updating the policy.

---

## Response format

The hook must respond with exactly one of:

| Response | Meaning |
|----------|---------|
| `{"ok": true}` | Allow the command |
| `{"ok": false, "reason": "..."}` | Deny the command; show reason to user |
| `{"ask": true, "reason": "..."}` | Request user approval in Cursor UI before running |

---

## ALLOW (low risk)

- Read-only commands: `git status`, `git diff`, `git log`, `ls`, `cat`, etc.
- `npm install`, `npm ci`
- `npm run build`, `npm run dev`, `npm run lint`, `npm run check`, `npm test`
- `npx prisma migrate dev`, `npx prisma generate`, `npx prisma db push`
- `npm run db:migrate`, `npm run db:generate`, `npm run db:seed`, `npm run db:push`
- Local development and tooling

---

## DENY (high risk)

- `rm -rf` or equivalent destructive deletes
- `git push --force`, `git push -f`, or any force push
- Production database URL or prod secrets in commands
- Overwriting `.env` with production values
- Irreversible or destructive commands

---

## ASK (medium risk — user approves)

- First-time `git push` to remote (new repo, new branch)
- Deploy-like commands (e.g. `vercel deploy`, `vercel --prod`)
- Network-heavy or external API calls that could have side effects

Return `{"ask": true, "reason": "..."}` so the user can approve in the Cursor UI before the command runs.
