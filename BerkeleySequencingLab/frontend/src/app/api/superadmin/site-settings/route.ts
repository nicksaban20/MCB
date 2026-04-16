import { NextResponse } from 'next/server';
import { isSuperadminRole, requireAuthenticatedUser } from '@/app/api/_lib/auth';
import { logAdminAction } from '@/app/api/_lib/audit';

type SiteSettingsValue = {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  announcementText: string;
};

const SETTINGS_KEY = 'general';

const DEFAULT_SETTINGS: SiteSettingsValue = {
  siteName: 'Berkeley Sequencing Lab',
  supportEmail: 'berkeleysequencinglab@gmail.com',
  maintenanceMode: false,
  announcementText: '',
};

function normalizeSettings(input: Partial<SiteSettingsValue> | null | undefined): SiteSettingsValue {
  return {
    siteName: typeof input?.siteName === 'string' && input.siteName.trim()
      ? input.siteName.trim()
      : DEFAULT_SETTINGS.siteName,
    supportEmail: typeof input?.supportEmail === 'string' && input.supportEmail.trim()
      ? input.supportEmail.trim()
      : DEFAULT_SETTINGS.supportEmail,
    maintenanceMode: Boolean(input?.maintenanceMode),
    announcementText: typeof input?.announcementText === 'string'
      ? input.announcementText.trim()
      : DEFAULT_SETTINGS.announcementText,
  };
}

export async function GET() {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, role } = authResult.context;

    if (!isSuperadminRole(role)) {
      return NextResponse.json(
        { error: 'Forbidden: superadmin role required' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value, updated_at')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load site settings', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      key: SETTINGS_KEY,
      settings: normalizeSettings((data?.value as Partial<SiteSettingsValue> | undefined) ?? undefined),
      updatedAt: data?.updated_at ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireAuthenticatedUser();

    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { supabase, user, role } = authResult.context;

    if (!isSuperadminRole(role)) {
      return NextResponse.json(
        { error: 'Forbidden: superadmin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const settings = normalizeSettings(body?.settings as Partial<SiteSettingsValue> | undefined);

    const { data, error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: SETTINGS_KEY,
          value: settings,
          updated_by: user.id,
        },
        { onConflict: 'key' }
      )
      .select('key, value, updated_at')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save site settings', details: error.message },
        { status: 500 }
      );
    }

    await logAdminAction(
      { supabase, user, role },
      {
        action: 'site_settings_updated',
        targetTable: 'site_settings',
        targetId: SETTINGS_KEY,
        metadata: settings,
      }
    );

    return NextResponse.json({
      key: SETTINGS_KEY,
      settings: normalizeSettings((data?.value as Partial<SiteSettingsValue> | undefined) ?? undefined),
      updatedAt: data?.updated_at ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
