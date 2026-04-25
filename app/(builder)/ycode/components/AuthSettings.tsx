'use client';

/**
 * Auth Settings Component
 *
 * Settings panel for authentication layers (login, register, forgot password)
 */

import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import SettingsPanel from './SettingsPanel';
import LinkSettings from './LinkSettings';
import type { Layer, LinkSettingsValue, LayerAuthSettings } from '@/types';

interface AuthSettingsProps {
  layer: Layer | null;
  onLayerUpdate: (layerId: string, updates: Partial<Layer>) => void;
}

export default function AuthSettings({ layer, onLayerUpdate }: AuthSettingsProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleRedirectLinkChange = useCallback(
    (value: LinkSettingsValue) => {
      if (!layer) return;

      onLayerUpdate(layer.id, {
        settings: {
          ...layer.settings,
          auth: {
            ...layer.settings?.auth,
            redirectUrl: value,
          },
        },
      });
    },
    [layer, onLayerUpdate]
  );

  const handleToggle = useCallback(
    (key: keyof LayerAuthSettings, value: boolean) => {
      if (!layer) return;

      onLayerUpdate(layer.id, {
        settings: {
          ...layer.settings,
          auth: {
            ...layer.settings?.auth,
            [key]: value,
          },
        },
      });
    },
    [layer, onLayerUpdate]
  );

  if (!layer || !['authLogin', 'authRegister', 'authForgotPassword'].includes(layer.name || '')) {
    return null;
  }

  const authSettings = layer.settings?.auth || {};

  return (
    <SettingsPanel
      title="Authentication Settings"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <div className="flex flex-col gap-4">
        {/* Redirect destination */}
        {layer.name !== 'authForgotPassword' && (
          <LinkSettings
            mode="standalone"
            value={authSettings.redirectUrl}
            onChange={handleRedirectLinkChange}
            gridLayout
            typeLabel="Redirect to"
            allowedTypes={['page', 'url']}
            hideBehavior
          />
        )}

        {/* Social login toggles */}
        {['authLogin', 'authRegister'].includes(layer.name || '') && (
          <div className="flex flex-col gap-3">
            <Label variant="muted">Providers</Label>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="show-google" 
                checked={authSettings.showGoogle !== false} 
                onCheckedChange={(checked) => handleToggle('showGoogle', !!checked)}
              />
              <label htmlFor="show-google" className="text-xs cursor-pointer">Show Google</label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="show-github" 
                checked={!!authSettings.showGithub} 
                onCheckedChange={(checked) => handleToggle('showGithub', !!checked)}
              />
              <label htmlFor="show-github" className="text-xs cursor-pointer">Show GitHub</label>
            </div>
          </div>
        )}

        {/* Register specific settings */}
        {layer.name === 'authRegister' && (
          <div className="flex flex-col gap-3">
            <Label variant="muted">Registration Fields</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="show-name" 
                checked={authSettings.showNameField !== false} 
                onCheckedChange={(checked) => handleToggle('showNameField', !!checked)}
              />
              <label htmlFor="show-name" className="text-xs cursor-pointer">Show name field</label>
            </div>
          </div>
        )}
      </div>
    </SettingsPanel>
  );
}
