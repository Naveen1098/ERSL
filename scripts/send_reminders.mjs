// Sends email reminders for tasks that are overdue or due within 2 days.
// Run daily by .github/workflows/reminders.yml using the secrets listed in SETUP-LOGIN.md.
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const {
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL, SITE_URL,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.log('Reminder secrets not configured; skipping.');
  process.exit(0);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const mail = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const today = new Date(); today.setUTCHours(0, 0, 0, 0);
const limit = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10);

const { data: tasks, error } = await db
  .from('tasks')
  .select('id,title,due_date,status,owner_id,profiles!tasks_owner_id_fkey(name,email)')
  .neq('status', 'completed')
  .not('due_date', 'is', null)
  .lte('due_date', limit);
if (error) { console.error(error); process.exit(1); }

const label = (d) => {
  const diff = Math.round((new Date(d + 'T00:00:00Z') - today) / 86400000);
  return diff < 0 ? `OVERDUE by ${-diff} day(s)` : diff === 0 ? 'due TODAY' : `due in ${diff} day(s)`;
};

const byOwner = new Map();
for (const t of tasks) {
  const p = t.profiles;
  if (!p?.email) continue;
  if (!byOwner.has(p.email)) byOwner.set(p.email, { name: p.name, items: [] });
  byOwner.get(p.email).items.push(t);
}

const from = `ERSL Work Plan <${SMTP_USER}>`;
const link = SITE_URL ? `\n\nOpen the work plan: ${SITE_URL}` : '';

for (const [email, { name, items }] of byOwner) {
  const lines = items.map(t => `- ${t.title} (${t.due_date}): ${label(t.due_date)} [${t.status}]`).join('\n');
  await mail.sendMail({ from, to: email, subject: 'ERSL work plan: tasks need attention',
    text: `Hi ${name || ''},\n\nThese tasks are due soon or overdue:\n\n${lines}${link}` });
  console.log('Sent to', email);
}

if (ADMIN_EMAIL && byOwner.size) {
  const digest = [...byOwner.values()].map(({ name, items }) =>
    `${name}:\n` + items.map(t => `  - ${t.title} (${t.due_date}): ${label(t.due_date)}`).join('\n')).join('\n\n');
  await mail.sendMail({ from, to: ADMIN_EMAIL, subject: 'ERSL work plan: team digest', text: digest + link });
  console.log('Sent admin digest');
}
