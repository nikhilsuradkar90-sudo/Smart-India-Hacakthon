import { Globe, Palette, Accessibility, MessageSquareText, FileText, Lock, Info } from 'lucide-react';
import type { AppSettings, ThemeMode } from '@/types';
import { useSettings } from '@/hooks/use-settings';
import { LANGUAGES } from '@/data/constants';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// ============================================================
// Settings page
// ============================================================

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your BIS AI Assistant experience. Settings are saved locally.
        </p>
      </div>

      <div className="space-y-6">
        {/* Language */}
        <SettingsSection icon={Globe} title="Language" description="Select your preferred interface language.">
          <div className="space-y-2">
            <Label htmlFor="language-select">Interface Language</Label>
            <Select value={settings.language} onValueChange={(v) => updateSettings({ language: v })}>
              <SelectTrigger id="language-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeLabel} ({lang.label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Full UI translations and multilingual AI will be available in Phase 2.
            </p>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection icon={Palette} title="Appearance" description="Customize how the application looks.">
          <div className="space-y-3">
            <div>
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(v) => updateSettings({ theme: v as ThemeMode })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Font Size</Label>
              <Select value={settings.fontSize} onValueChange={(v) => updateSettings({ fontSize: v as AppSettings['fontSize'] })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        {/* Accessibility */}
        <SettingsSection icon={Accessibility} title="Accessibility" description="Adjust settings for better accessibility.">
          <ToggleRow
            label="High Contrast"
            description="Increase visual contrast for better readability."
            checked={settings.highContrast}
            onCheckedChange={(v) => updateSettings({ highContrast: v })}
          />
          <Separator />
          <ToggleRow
            label="Reduce Motion"
            description="Minimize animations and transitions."
            checked={settings.reduceMotion}
            onCheckedChange={(v) => updateSettings({ reduceMotion: v })}
          />
        </SettingsSection>

        {/* Chat Preferences */}
        <SettingsSection icon={MessageSquareText} title="Chat Preferences" description="Customize the AI Assistant chat experience.">
          <ToggleRow
            label="Compact Chat"
            description="Reduce spacing between chat messages."
            checked={settings.compactChat}
            onCheckedChange={(v) => updateSettings({ compactChat: v })}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={Lock} title="Notifications" description="Control application notifications.">
          <ToggleRow
            label="Enable Notifications"
            description="Show alerts for important updates and actions."
            checked={settings.notifications}
            onCheckedChange={(v) => updateSettings({ notifications: v })}
          />
        </SettingsSection>

        {/* Source Display */}
        <SettingsSection icon={FileText} title="Source Display" description="Control how source references are shown.">
          <ToggleRow
            label="Show Sources"
            description="Display source references and citations in AI responses."
            checked={settings.showSources}
            onCheckedChange={(v) => updateSettings({ showSources: v })}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection icon={Lock} title="Privacy" description="Your data and privacy settings.">
          <p className="text-sm text-muted-foreground">
            In Phase 1, all data is stored locally in your browser. Chat history and settings are not sent to any server.
            In Phase 2, you will have additional privacy controls when the AI service is connected.
          </p>
        </SettingsSection>

        {/* About */}
        <SettingsSection icon={Info} title="About" description="Application information.">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Application</dt>
              <dd className="font-medium">BIS AI Assistant</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Version</dt>
              <dd className="font-medium">Phase 1 — Frontend Demo</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mode</dt>
              <dd className="font-medium">Demo (AI not connected)</dd>
            </div>
          </dl>
        </SettingsSection>

        <div className="flex justify-end">
          <Button variant="outline" onClick={resetSettings}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: { icon: typeof Globe; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

function ToggleRow({ label, description, checked, onCheckedChange }: { label: string; description: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}
