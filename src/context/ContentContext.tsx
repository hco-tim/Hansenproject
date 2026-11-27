"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { initialContent, type SiteContent } from "@/data/initialContent";

interface ContentContextType {
  content: SiteContent;
  loading: boolean;
  saving: boolean;
  updateContent: (newContent: SiteContent) => void;
  /** Legacy compatibility for the inactive CMS editor. No network/API request is made. */
  saveToGitHub: (customContent?: SiteContent) => Promise<{ success: boolean; message: string }>;
  /** Legacy compatibility for the inactive CMS editor. Public content is supplied at build time. */
  reloadContent: () => Promise<{ success: boolean; message?: string }>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export interface ContentProviderProps {
  children: React.ReactNode;
  initialData?: SiteContent;
}

export function ContentProvider({ children, initialData }: ContentProviderProps) {
  const [content, setContent] = useState<SiteContent>(initialData ?? initialContent);

  const updateContent = useCallback((newContent: SiteContent) => {
    setContent(newContent);
  }, []);

  // The CMS is intentionally inactive on the static site. Keep these no-network
  // stubs temporarily so unmounted legacy admin components still type-check.
  const saveToGitHub = useCallback(async () => ({
    success: false,
    message: "CMS tidak aktif. Perbarui konten melalui repository lalu jalankan deployment.",
  }), []);

  const reloadContent = useCallback(async () => ({
    success: false,
    message: "Konten publik dimuat saat build. Muat ulang konten melalui deployment baru.",
  }), []);

  return (
    <ContentContext.Provider
      value={{
        content,
        loading: false,
        saving: false,
        updateContent,
        saveToGitHub,
        reloadContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
