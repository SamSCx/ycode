'use client';

import { useState, useCallback } from 'react';
import {
  Field, FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSeparator
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function AuthSettingsPage() {
  const { getSettingByKey, saveSettings } = useSettingsStore();

  const storedSupabaseAuth = getSettingByKey('supabase_auth') as {
    enabled?: boolean;
    project_url?: string;
    anon_key?: string;
  } | null;

  const [enabled, setEnabled] = useState(storedSupabaseAuth?.enabled ?? false);
  const [projectUrl, setProjectUrl] = useState(storedSupabaseAuth?.project_url || '');
  const [anonKey, setAnonKey] = useState(storedSupabaseAuth?.anon_key || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await saveSettings({
      supabase_auth: {
        enabled,
        project_url: projectUrl.trim(),
        anon_key: anonKey.trim(),
      },
    });
    setIsSaving(false);
  }, [saveSettings, enabled, projectUrl, anonKey]);

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <header className="pt-8 pb-3">
          <span className="text-base font-medium">Authentication</span>
        </header>

        <div className="mt-2 grid grid-cols-3 gap-10 bg-secondary/20 p-8 rounded-lg">
          <div>
            <FieldLegend>Supabase Authentication</FieldLegend>
            <FieldDescription>
              Configure Supabase Auth to enable user registration, login, and protected pages on your website.
            </FieldDescription>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-5">
            <Field orientation="horizontal" className="flex-row-reverse col-span-2">
              <FieldContent>
                <FieldLabel htmlFor="auth-enabled">Enable Supabase Authentication</FieldLabel>
                <FieldDescription>
                  Turn on to enable authentication features. Make sure your Project URL and Anon Key are correct.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="auth-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </Field>

            <FieldSeparator className="col-span-2" />

            {enabled && (
              <>
                <Field className="col-span-2">
                  <FieldLabel htmlFor="project-url">
                    Supabase Project URL
                  </FieldLabel>
                  <FieldDescription>
                    Your project URL. Example: https://xxxxxxxxxxxxxx.supabase.co
                  </FieldDescription>
                  <Input
                    id="project-url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    type="url"
                  />
                </Field>

                <Field className="col-span-2">
                  <FieldLabel htmlFor="anon-key">
                    Supabase Anon Key
                  </FieldLabel>
                  <FieldDescription>
                    Your project's public anon key. This is safe to expose in the browser.
                  </FieldDescription>
                  <Input
                    id="anon-key"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    type="password"
                  />
                </Field>

                <FieldSeparator className="col-span-2" />
              </>
            )}

            <div className="col-span-2 flex justify-end">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
