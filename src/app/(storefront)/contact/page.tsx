import { getSettings } from "@/lib/data/settings";
import type { HomepageConfig, ContactConfig, FooterConfig, ContactInfo } from "@/types";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: `Contact Us | ${settings?.site_title ?? "Our Store"}`,
  };
}

export default async function ContactPage() {
  const settings = await getSettings();
  const homepage = settings?.homepage_config as HomepageConfig | null;
  const contactCfg = (settings as any)?.contact_config as ContactConfig | null;
  const footer = settings?.footer_config as FooterConfig | null;
  const contactInfo = settings?.contact_info as ContactInfo | null;

  const bgColor = homepage?.bg_color ?? "#ffffff";
  const fontColor = homepage?.font_color ?? "#111827";
  const social = (footer?.social ?? []).filter((s) => s.platform && s.url);

  return (
    <div style={{ backgroundColor: bgColor, color: fontColor, minHeight: "60vh" }}>
      <ContactForm
        heading={contactCfg?.heading ?? "Get in Touch"}
        subheading={contactCfg?.subheading ?? "I'd like to hear from you!"}
        bodyText={contactCfg?.body_text ?? "If you have any inquiries or just want to say hi, please use the contact form!"}
        email={contactInfo?.email ?? null}
        social={social}
        bgColor={bgColor}
        fontColor={fontColor}
      />
    </div>
  );
}
