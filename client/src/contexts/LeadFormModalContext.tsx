import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { trackModalOpen, trackModalClose, trackFormAbandon } from "@/lib/analytics";

interface LeadFormModalContextType {
  isOpen: boolean;
  selectedCategory?: string;
  renderKey: number;
  openLeadForm: (category?: string, triggerElement?: string) => void;
  closeLeadForm: (closeMethod?: "close_button" | "overlay_click" | "esc_key") => void;
  reportStep: (stepNumber: number) => void;
  reportCompleted: () => void;
}

const LeadFormModalContext = createContext<LeadFormModalContextType | undefined>(undefined);

export function LeadFormModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  // Wird bei jedem openLeadForm()-Aufruf hochgezählt und als key={renderKey}
  // auf <LeadForm /> gesetzt, damit das Formular bei jedem Öffnen sauber neu
  // gemountet wird (verhindert stale defaultValues wie z.B. aufbauart).
  const [renderKey, setRenderKey] = useState(0);

  const lastStepRef = useRef<number>(1);
  const completedRef = useRef<boolean>(false);
  const hasClosedRef = useRef<boolean>(false);

  const openLeadForm = useCallback((category?: string, triggerElement: string = "unknown_cta") => {
    setSelectedCategory(category);
    setRenderKey((k) => k + 1);
    setIsOpen(true);
    lastStepRef.current = 1;
    completedRef.current = false;
    hasClosedRef.current = false;

    const readableCategory =
      category === "__dealer_paket_anfrage__" ? "dealer_inquiry" : category;

    trackModalOpen(triggerElement, readableCategory ? { prefilled_category: readableCategory } : undefined);
  }, []);

  const closeLeadForm = useCallback((closeMethod: "close_button" | "overlay_click" | "esc_key" = "close_button") => {
    setIsOpen(false);
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;

    trackModalClose(closeMethod, lastStepRef.current);
    if (!completedRef.current) {
      trackFormAbandon(lastStepRef.current);
    }
  }, []);

  const reportStep = useCallback((stepNumber: number) => {
    lastStepRef.current = stepNumber;
  }, []);

  const reportCompleted = useCallback(() => {
    completedRef.current = true;
  }, []);

  return (
    <LeadFormModalContext.Provider
      value={{ isOpen, selectedCategory, renderKey, openLeadForm, closeLeadForm, reportStep, reportCompleted }}
    >
      {children}
    </LeadFormModalContext.Provider>
  );
}

export function useLeadFormModal() {
  const context = useContext(LeadFormModalContext);
  if (!context) {
    throw new Error("useLeadFormModal must be used within LeadFormModalProvider");
  }
  return context;
}
