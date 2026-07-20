/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { uploadAsset, type AssetType } from "@/lib/storage/StorageService";

interface UploadImageProps {
  label: string;
  value: string | null;
  type: AssetType;
  accept: string;
  hint: string;
  onUpload: (url: string | null) => void;
  disabled: boolean;
}

export function UploadImage({
  label,
  value,
  type,
  accept,
  hint,
  onUpload,
  disabled,
}: UploadImageProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    try {
      const result = await uploadAsset(file, type);
      onUpload(result.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-sand bg-sand">
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-contain" />
        ) : (
          <span className="text-2xl text-muted">🖼</span>
        )}
      </div>

      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          id={`upload-${type}`}
          onChange={handleFile}
          disabled={disabled || uploading}
        />
        <label
          htmlFor={`upload-${type}`}
          className={`inline-block cursor-pointer rounded-lg border border-chocolate px-3 py-2 text-sm font-medium text-chocolate transition hover:bg-sand ${disabled || uploading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {uploading ? "Enviando…" : value ? "Trocar imagem" : "Escolher imagem"}
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onUpload(null)}
            className="ml-2 text-xs text-muted underline"
            disabled={disabled}
          >
            Remover
          </button>
        )}

        <p className="mt-1 text-xs text-muted">{hint}</p>
        {uploadError && <p className="mt-1 text-xs text-rose">{uploadError}</p>}
      </div>
    </div>
  );
}
