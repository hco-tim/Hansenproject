"use client";

import React, { createContext, useContext } from "react";
import { initialContent, type SiteContent } from "@/data/initialContent";

interface ContentContextType {
  content: SiteContent;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export interface ContentProviderProps {
  children: React.ReactNode;
  initialData?: SiteContent;
}

export function ContentProvider({ children, initialData }: ContentProviderProps) {
  const content = initialData ?? initialContent;

  return (
    <ContentContext.Provider value={{ content }}>
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
