ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS chat_config JSONB NOT NULL DEFAULT '{"enabled": false, "property_id": "", "widget_id": "default"}'::jsonb;
