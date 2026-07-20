"use client";

import { Section } from "@/components/admin/config/FormPrimitives";
import { UploadImage } from "@/components/admin/config/UploadImage";

interface BrandSectionProps {
  logoUrl: string | null;
  faviconUrl: string | null;
  disabled: boolean;
  onLogoChange: (url: string | null) => void;
  onFaviconChange: (url: string | null) => void;
}

export function BrandSection({
  logoUrl,
  faviconUrl,
  disabled,
  onLogoChange,
  onFaviconChange,
}: BrandSectionProps) {
  return (
    <Section title="Identidade visual">
      <div>
        <p className="mb-2 text-sm font-medium text-chocolate">Logomarca</p>
        <UploadImage
          label="Logomarca"
          value={logoUrl}
          type="logo"
          accept="image/jpeg,image/png,image/svg+xml,image/webp"
          hint="JPEG, PNG, SVG ou WebP · máx. 2 MB"
          onUpload={onLogoChange}
          disabled={disabled}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-chocolate">Favicon</p>
        <UploadImage
          label="Favicon"
          value={faviconUrl}
          type="favicon"
          accept="image/png,image/svg+xml,image/x-icon"
          hint="PNG, SVG ou ICO · máx. 512 KB"
          onUpload={onFaviconChange}
          disabled={disabled}
        />
      </div>
    </Section>
  );
}
