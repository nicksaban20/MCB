import type { AuthContext } from '@/app/api/_lib/auth';

type AuditLogInput = {
  action: string;
  targetTable: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAdminAction(
  context: Pick<AuthContext, 'supabase' | 'user' | 'role'>,
  input: AuditLogInput
) {
  if (context.role !== 'staff' && context.role !== 'superadmin') {
    return;
  }

  const { error } = await context.supabase
    .from('admin_audit_logs')
    .insert([
      {
        actor_user_id: context.user.id,
        actor_role: context.role,
        action: input.action,
        target_table: input.targetTable,
        target_id: input.targetId ?? null,
        metadata: input.metadata ?? {},
      },
    ]);

  if (error) {
    console.error('Failed to write admin audit log:', error);
  }
}
