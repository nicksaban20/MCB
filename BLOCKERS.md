# MCB Berkeley Sequencing Lab - Blockers

## Supabase Admin Tasks

These require access to the Supabase dashboard or the service role key.

| # | Task | Detail | Impact |
|---|------|--------|--------|
| 1 | Add `notes` column to `dna_orders` | `ALTER TABLE dna_orders ADD COLUMN notes text;` | Admin dashboard notes feature won't persist without this |
| 2 | Add `role` column to `user_profiles` | `ALTER TABLE user_profiles ADD COLUMN role text DEFAULT 'customer';` with values: `customer`, `staff`, `superadmin` | RBAC is currently based on `user_metadata.is_admin` boolean only. Need proper role system |
| 3 | Configure Row Level Security (RLS) | Customers should only see their own orders/samples. Staff/admin see all. Policies needed on `dna_orders`, `dna_samples`, `support_tickets`, `notifications` | Currently any authenticated user can read all data |
| 4 | Create `delete_user_account` RPC function | Server-side function to delete a user and their associated data. Needs service role since users can't delete themselves via the client | Account deletion currently signs the user out and asks them to email Scott |
| 5 | Verify `support_tickets` table schema | Needs columns: `id`, `user_id`, `subject`, `message`, `order_id`, `status`, `created_at`. Status values: `open`, `in_progress`, `resolved` | Support page writes to this table. If columns don't match, ticket creation will fail |
| 6 | Verify `plates` / `plate_wells` table schema | Need to confirm column names so the plate management UI can persist assignments | Plate selection page is UI-only with no data persistence |
| 7 | Set up Supabase webhook or DB trigger for notifications | When `dna_orders.status` changes, insert a row into `notifications` and optionally send an email | No notification system currently |

## Scott Tasks

These require Scott's credentials, access, or decision-making.

| # | Task | Detail | Impact |
|---|------|--------|--------|
| 1 | GCP deployment | Provide GCP project ID and credentials, or grant the team deploy access. Need to set up Cloud Run or App Engine for the Next.js app | Site only runs on localhost |
| 2 | Domain and SSL | What domain will the site live at? Need to configure DNS and SSL cert | No public URL |
| 3 | CI/CD pipeline | Once GCP access is granted, we can set up GitHub Actions to auto-deploy on push to main | Manual deploys only |
| 4 | Verify Resend email sender domain | Currently using `onboarding@resend.dev` which is a test domain. Need to verify a real domain (e.g. `berkeley.edu` or a subdomain) in Resend | Contact form emails may land in spam or not deliver |
| 5 | Provide Spring 2025 chatbot code | The spec calls for GenAI chatbot integration. Need the chatbot repo or deployment URL from the Spring 2025 team | Chatbot integration not started |
| 6 | Provide Supabase service role key | Needed for RLS policies, DB migrations, and server-side functions. The anon key we have can only do client-level operations | Multiple backend tasks are blocked |
| 7 | MailChimp API key (if still wanted) | Spec mentions email marketing / newsletter integration | Email marketing not started |
| 8 | Where are result files stored? | .ab1 and .seq files from sequencing runs - are they on Supabase Storage, Google Cloud Storage, a local server? | Can't build the results file viewer without knowing the source |
| 9 | Google Calendar API key (optional) | If live calendar sync is wanted instead of hardcoded dates | Calendar page currently uses hardcoded UC Berkeley academic dates |

---

## Draft Emails

### Email to Scott

---

Subject: Sequencing Lab Portal - Need a few things from you to finish up

Hi Scott,

The team has made a lot of progress on the portal. We pushed a big update today - you can see everything at https://github.com/nicksaban20/MCB. Here's a quick summary of what's new:

- Admin dashboard now has search, filtering, and the ability to edit order status
- New pages: FAQ, Terms & Conditions, Sample Guidelines, Calendar, Links, Results Interpretation Guide, Search, and Support tickets
- Order form now saves samples to the database properly
- Contact page sends real emails
- Security headers, RBAC middleware for admin routes, announcements ticker across the site
- Login and hero pages cleaned up with real content

To wrap things up for the semester, we're blocked on a few things and could use your help:

1. **GCP access** - Can you share the GCP project ID and grant us deploy access? We're ready to get this off localhost.
2. **Supabase service role key** - We need this to set up Row Level Security, database migrations, and a few server-side functions. The anon key we have is limited to client operations.
3. **Email domain** - The contact form works but sends from a test address (onboarding@resend.dev). Do you have a domain we can verify in Resend so emails actually deliver?
4. **Chatbot from Spring 2025** - The spec mentions integrating the GenAI chatbot. Do you have the repo or a deployment URL from that team?
5. **Result files** - Where are the .ab1 and .seq files stored? We want to build the file viewer you mentioned but need to know the storage location.
6. **MailChimp** - Still want newsletter integration? If so we'd need an API key.

Happy to meet this week to go over everything. Let us know what times work.

Thanks,
Nick

---

### Email to Supabase Admin (or Scott, if he manages Supabase)

---

Subject: Sequencing Lab - Supabase schema changes needed

Hi,

We need a few changes in the Supabase project to finish up features on the sequencing lab portal. If you have dashboard access, these should be quick:

**SQL to run:**

```sql
-- 1. Add notes column for admin internal notes on orders
ALTER TABLE dna_orders ADD COLUMN IF NOT EXISTS notes text;

-- 2. Add role column for RBAC (defaults to customer)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';
-- Then manually set staff/admin users:
-- UPDATE user_profiles SET role = 'staff' WHERE id = '<user-id>';
-- UPDATE user_profiles SET role = 'superadmin' WHERE id = '<user-id>';
```

**RLS policies needed:**

```sql
-- Customers only see their own orders
ALTER TABLE dna_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orders" ON dna_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON dna_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff/admin see all orders
CREATE POLICY "Staff see all orders" ON dna_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('staff', 'superadmin'))
  );

-- Same pattern for dna_samples, support_tickets, notifications
```

**Also need:**
- Confirmation that the `support_tickets` table has these columns: `id`, `user_id`, `subject`, `message`, `order_id`, `status`, `created_at`
- Confirmation of the `plates` and `plate_wells` column schemas so we can hook up plate management

Let me know if you need anything from our side.

Thanks,
Nick

---
