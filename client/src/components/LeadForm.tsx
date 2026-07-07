import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Send, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLeadFormModal } from "@/contexts/LeadFormModalContext";
import {
  trackModalStepView,
  trackModalStepCompleted,
  trackFormError,
  trackFormStart,
  trackFormSubmit,
} from "@/lib/analytics";

// Form Validation Schema with Zod (German error messages)
const leadFormSchema = z.object({
  lead_type: z.enum(["einzel", "paket"]),
  aufbauart: z.string().min(1, "Bitte wählen Sie eine Aufbauart."),
  fahrgestell_vorhanden: z.enum(["Ja", "Nein"]),
  wunschzeitraum: z.string().min(1, "Bitte wählen Sie einen Wunschzeitraum."),
  einsatzregion: z.string().min(2, "Bitte geben Sie eine Einsatzregion oder PLZ an."),
  email: z.string().min(1, "Bitte geben Sie Ihre E-Mail-Adresse an.").email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  vorname: z.string().min(2, "Bitte geben Sie Ihren Vornamen an."),
  nachname: z.string().min(2, "Bitte geben Sie Ihren Nachnamen an."),
  unternehmen: z.string().min(2, "Bitte geben Sie Ihr Unternehmen an."),
  telefon: z.string().optional(),
  spezifikation: z.string().optional(),
  datenschutz_akzeptiert: z.boolean().refine((val) => val === true, {
    message: "Bitte stimmen Sie der Datenschutzerklärung zu.",
  }),

  // Conditional fields for "paket" (Hersteller-Anfrage)
  stueckzahl: z.number().optional(),
  taktung: z.string().optional(),
  lieferort: z.string().optional(),
  deadline: z.string().optional(),

  // Honeypot: bleibt für echte Nutzer unsichtbar, Bots füllen es häufig aus
  website: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const inputClass = "w-full border border-brand-grey/30 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan h-11 bg-white px-3 text-base rounded-lg outline-none";
const selectClass = `${inputClass} appearance-none`;

export default function LeadForm() {
  const { closeLeadForm, reportStep, reportCompleted } = useLeadFormModal();
  const formRootRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [leadType, setLeadType] = useState<"einzel" | "paket">("einzel");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    score: "A" | "B" | "C";
    payload?: any;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    mode: "onTouched",
    defaultValues: {
      lead_type: "einzel",
      aufbauart: "",
      fahrgestell_vorhanden: "Nein",
      wunschzeitraum: "",
      einsatzregion: "",
      email: "",
      vorname: "",
      nachname: "",
      unternehmen: "",
      telefon: "",
      spezifikation: "",
      datenschutz_akzeptiert: false,
      stueckzahl: 1,
      taktung: "",
      lieferort: "",
      deadline: "",
      website: "",
    },
  });

  const fahrgestellVorhanden = watch("fahrgestell_vorhanden");
  const isPaket = leadType === "paket";
  const totalSteps = isPaket ? 3 : 2;
  const contactStep = isPaket ? 3 : 2;

  const stepsMeta = isPaket
    ? [
        { label: "Technische Angaben" },
        { label: "Flotten-Details" },
        { label: "Kontaktdaten" },
      ]
    : [
        { label: "Technische Angaben" },
        { label: "Kontaktdaten" },
      ];

  // Bei jedem Mount (= jedes Öffnen des Modals) Schritt 1 + form_start tracken
  useEffect(() => {
    trackModalStepView(1, stepsMeta[0].label, totalSteps);
    trackFormStart();
    reportStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lead-Scoring Algorithm (Brevo-Master-Scoring compatible: Hot >=70, Warm 40-69, Cold <40)
  const calculateLeadScore = (data: LeadFormValues): { grade: "A" | "B" | "C"; points: number } => {
    const today = new Date();
    const isFahrgestellJa = data.fahrgestell_vorhanden === "Ja";

    let daysToDeadline = 999;
    if (data.lead_type === "paket" && data.deadline) {
      const deadlineDate = new Date(data.deadline);
      const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
      daysToDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    let points = 0;

    // 1. Fahrgestell-Verfügbarkeit (Kritischster Faktor für schnellen Produktionsstart)
    if (isFahrgestellJa) {
      points += 40; // Sofort produktionsbereit
    } else {
      points += 10; // Braucht erst Fahrgestell-Beschaffung
    }

    // 2. Wunschzeitraum / Dringlichkeit
    if (data.wunschzeitraum === "Sofort (Takt-Einplanung)") {
      points += 30;
    } else if (data.wunschzeitraum === "Innerhalb 1 Monat") {
      points += 20;
    } else {
      points += 10;
    }

    // 3. Projekt-Größe & Typ (B2B Multiplier)
    if (data.lead_type === "paket") {
      const qty = data.stueckzahl || 1;
      if (qty >= 10) {
        points += 30; // Großflotte / Großkunde
      } else if (qty >= 3) {
        points += 20; // Mittlere Flotte
      } else {
        points += 15;
      }
    } else {
      points += 10; // Einzel-Umbau
    }

    // 4. Deadline-Dringlichkeit (nur für Pakete)
    if (data.lead_type === "paket" && daysToDeadline < 30) {
      points += 10; // Extrem eilig
    }

    // Map points to Score A, B, C (A = Hot >= 70, B = Warm 40-69, C = Cold < 40)
    let grade: "A" | "B" | "C";
    if (points >= 70) grade = "A";
    else if (points >= 40) grade = "B";
    else grade = "C";
    return { grade, points };
  };

  const onSubmit = async (data: LeadFormValues) => {
    // Honeypot: Feld ist für echte Nutzer unsichtbar, wird nur von Bots befüllt.
    // Bewusst KEIN form_submit/reportCompleted hier, damit Bot-Treffer die
    // Conversion-Zahlen nicht verfälschen.
    if (data.website) {
      setSubmitResult({ success: true, score: "C" });
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedScore = calculateLeadScore(data);

      // Hidden tracking fields (strictly carried along)
      const trackingData = {
        ...data,
        offer_type: "aufbau",
        lead_path: data.lead_type === "paket" ? "B2B-Hersteller-Pfad" : "Standard-Einzel-Pfad",
        leadScore: calculatedScore.points,
        leadGrade: { A: "Hot", B: "Warm", C: "Cold" }[calculatedScore.grade],
        utm_source: new URLSearchParams(window.location.search).get("utm_source") || "direct",
        utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || "none",
        utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "none",
        utm_term: new URLSearchParams(window.location.search).get("utm_term") || "none",
        utm_content: new URLSearchParams(window.location.search).get("utm_content") || "none",
      };

      const response = await fetch(import.meta.env.VITE_LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackingData),
      });

      if (!response.ok) {
        throw new Error(`Server antwortete mit Status ${response.status}`);
      }

      // Wichtig: reportCompleted() VOR setSubmitResult, damit ein direkt
      // folgendes Schließen des Modals NICHT zusätzlich als form_abandon zählt.
      reportCompleted();
      trackFormSubmit("lp2_expressangebot", totalSteps, {
        lead_grade: { A: "Hot", B: "Warm", C: "Cold" }[calculatedScore.grade],
        lead_type: data.lead_type,
      });

      setSubmitResult({
        success: true,
        score: calculatedScore.grade,
        payload: trackingData,
      });

      toast.success("Anfrage erfolgreich übermittelt!", {
        description: "Unsere Experten melden sich innerhalb von 24 Stunden bei Ihnen.",
      });
    } catch (error) {
      trackFormError(contactStep, ["submit_failed"]);
      toast.error("Fehler beim Senden.", {
        description: "Bitte überprüfen Sie Ihre Angaben und versuchen Sie es erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollFormToTop = () => {
    const scrollContainer = formRootRef.current?.querySelector("[data-lead-form-scroll-area]") as HTMLElement | null;
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof LeadFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["aufbauart", "fahrgestell_vorhanden", "wunschzeitraum", "einsatzregion", "email"];
    } else if (isPaket && step === 2) {
      fieldsToValidate = ["stueckzahl", "taktung", "lieferort", "deadline"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      trackModalStepCompleted(step, stepsMeta[step - 1]?.label ?? `step_${step}`);
      const nextStep = step + 1;
      trackModalStepView(nextStep, stepsMeta[nextStep - 1]?.label ?? `step_${nextStep}`, totalSteps);
      reportStep(nextStep);
      setStep((s) => s + 1);
      scrollFormToTop();
    } else {
      const invalidFields = fieldsToValidate.filter((f) => !!errors[f]);
      trackFormError(step, invalidFields);
      toast.error("Unvollständige Angaben", {
        description: "Bitte füllen Sie alle Pflichtfelder in diesem Schritt aus.",
      });
    }
  };

  const handleBack = () => {
    const prevStep = Math.max(1, step - 1);
    reportStep(prevStep);
    setStep((s) => Math.max(1, s - 1));
    scrollFormToTop();
  };

  const handleCloseAfterSuccess = () => {
    setSubmitResult(null);
    setStep(1);
    setLeadType("einzel");
    reset();
    closeLeadForm();
  };

  if (submitResult) {
    return (
      <div ref={formRootRef} className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-brand-grey/15 p-8 md:p-12 shadow-xl text-center max-w-2xl w-full relative overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Tech Grid Background */}
          <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(to_right,#6e7c950a_1px,transparent_1px),linear-gradient(to_bottom,#6e7c950a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
              <CheckCircle2 className="h-11 w-11" />
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-brand-navy tracking-tight leading-snug">
              Anfrage erfolgreich übermittelt!
            </h3>

            <p className="text-brand-grey leading-relaxed">
              Unsere Experten prüfen Ihre Angaben und melden sich innerhalb von 24 Stunden mit Ihrem Express-Angebot.
            </p>

            <button
              onClick={handleCloseAfterSuccess}
              className="min-h-11 w-full sm:w-auto bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base px-8 py-3 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 uppercase tracking-wider rounded-xl"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRootRef} className="flex-1 min-h-0 flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col bg-white rounded-none sm:rounded-2xl border-0 sm:border sm:border-brand-grey/15 shadow-none sm:shadow-xl relative">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 rounded-none sm:rounded-2xl bg-[linear-gradient(to_right,#6e7c950a_1px,transparent_1px),linear-gradient(to_bottom,#6e7c950a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* HEADER (fixed, non-scrolling): Titel + Fortschrittsanzeige */}
        <div className="relative z-10 shrink-0 px-6 pt-16 sm:pt-10 md:px-10 md:pt-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">Express-Konfigurator</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight leading-tight mt-2">Individuelles Angebot anfordern.</h3>
            <p className="text-brand-grey text-sm mt-2 leading-relaxed">
              Präzise Taktfertigung sichert Ihren Vorsprung. Füllen Sie das Formular in 2 Minuten aus und wir melden uns innerhalb von 24h.
            </p>
          </div>

          {/* Step Progress Bar */}
          <div className="relative pt-6 pb-2">
            <div className="absolute top-9 left-0 right-0 h-0.5 bg-brand-grey/10 z-0" />
            <div className="flex justify-between relative z-10">
              {stepsMeta.map((s, idx) => {
                const stepNum = idx + 1;
                const isCurrentOrDone = step >= stepNum;
                const isDone = step > stepNum;
                return (
                  <div key={s.label} className="flex flex-col items-center gap-1.5 bg-white px-1.5">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isCurrentOrDone ? "bg-brand-cyan text-brand-navy" : "bg-brand-grey/20 text-brand-grey"
                    }`}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                    </div>
                    <span className="hidden sm:block text-[10px] font-bold text-brand-navy uppercase tracking-wide text-center leading-snug max-w-[92px]">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="sm:hidden text-center text-xs font-bold text-brand-navy uppercase tracking-wide mt-3 leading-snug">
              Schritt {step} von {totalSteps}: {stepsMeta[step - 1]?.label}
            </p>
          </div>
        </div>

        {/* BODY (scrollt, wenn Inhalt nicht passt): Felder des aktuellen Schritts */}
        <div data-lead-form-scroll-area className="relative z-10 flex-1 min-h-0 overflow-y-auto px-6 md:px-10 pt-6">
          {step === 1 && (
            <div className="space-y-6 pb-6">
              {/* Single / Multi Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-brand-light p-1 border border-brand-grey/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setLeadType("einzel");
                    setValue("lead_type", "einzel");
                    setValue("stueckzahl", 1);
                    setValue("taktung", "");
                    setValue("lieferort", "");
                    setValue("deadline", "");
                  }}
                  className={`min-h-11 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-lg active:scale-98 ${
                    leadType === "einzel"
                      ? "bg-brand-navy text-white shadow-sm"
                      : "text-brand-grey hover:text-brand-navy"
                  }`}
                >
                  Einzel-Anfrage
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeadType("paket");
                    setValue("lead_type", "paket");
                  }}
                  className={`min-h-11 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-lg active:scale-98 ${
                    leadType === "paket"
                      ? "bg-brand-navy text-white shadow-sm"
                      : "text-brand-grey hover:text-brand-navy"
                  }`}
                >
                  Hersteller-Anfrage
                </button>
              </div>

              {/* Grid of Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aufbauart */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Aufbauart *</label>
                  <select {...register("aufbauart", { onChange: () => trigger("aufbauart") })} className={selectClass}>
                    <option value="">-- Bitte wählen --</option>
                    <option value="Kipper">Dreiseitenkipper</option>
                    <option value="Kofferaufbau">Kofferaufbau (Standard / Isoliert)</option>
                    <option value="Pritsche">Pritsche / Bordwand</option>
                    <option value="Spezial">Spezialaufbau (Custom)</option>
                  </select>
                  {errors.aufbauart && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.aufbauart.message}
                    </p>
                  )}
                </div>

                {/* Fahrgestell vorhanden */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Fahrgestell bereits vorhanden? *</label>
                  <div className="grid grid-cols-2 gap-4 h-11">
                    <label className={`flex items-center justify-center border rounded-lg cursor-pointer font-semibold text-sm transition-all ${
                      fahrgestellVorhanden === "Ja"
                        ? "border-brand-cyan bg-brand-cyan/10 text-brand-navy"
                        : "border-brand-grey/30 hover:bg-brand-light"
                    }`}>
                      <input
                        type="radio"
                        value="Ja"
                        {...register("fahrgestell_vorhanden")}
                        className="sr-only"
                      />
                      Vorhanden
                    </label>
                    <label className={`flex items-center justify-center border rounded-lg cursor-pointer font-semibold text-sm transition-all ${
                      fahrgestellVorhanden === "Nein"
                        ? "border-brand-cyan bg-brand-cyan/10 text-brand-navy"
                        : "border-brand-grey/30 hover:bg-brand-light"
                    }`}>
                      <input
                        type="radio"
                        value="Nein"
                        {...register("fahrgestell_vorhanden")}
                        className="sr-only"
                      />
                      Nicht vorhanden
                    </label>
                  </div>
                </div>

                {/* Wunschzeitraum */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Wunschzeitraum *</label>
                  <select {...register("wunschzeitraum", { onChange: () => trigger("wunschzeitraum") })} className={selectClass}>
                    <option value="">-- Bitte wählen --</option>
                    <option value="Sofort (Takt-Einplanung)">Sofort (Takt-Einplanung)</option>
                    <option value="Innerhalb 1 Monat">Innerhalb 1 Monat</option>
                    <option value="In 2-3 Monaten">In 2-3 Monaten</option>
                    <option value="Nur Preisindikation">Nur Preisindikation</option>
                  </select>
                  {errors.wunschzeitraum && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.wunschzeitraum.message}
                    </p>
                  )}
                </div>

                {/* Einsatzregion */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Einsatzregion / PLZ *</label>
                  <input
                    type="text"
                    placeholder="z.B. 42799 Leichlingen oder NRW"
                    {...register("einsatzregion")}
                    className={inputClass}
                  />
                  {errors.einsatzregion && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.einsatzregion.message}
                    </p>
                  )}
                </div>
              </div>

              {/* E-Mail (früh erfasst für Teil-Lead bei Abbruch) */}
              <div className="space-y-2">
                <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">E-Mail-Adresse *</label>
                <input
                  type="email"
                  placeholder="m.mustermann@firma.de"
                  {...register("email")}
                  className={inputClass}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {isPaket && step === 2 && (
            <div className="space-y-6 pb-6 animate-in fade-in-0 duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-cyan border-b border-brand-grey/10 pb-2">
                Hersteller & Flotten-Spezifikationen
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stückzahl */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Erwartete Stückzahl *</label>
                  <input
                    type="number"
                    min="1"
                    {...register("stueckzahl", { valueAsNumber: true })}
                    className={inputClass}
                  />
                </div>

                {/* Taktung */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Gewünschte Taktung / Abrufe</label>
                  <select {...register("taktung")} className={selectClass}>
                    <option value="">-- Bitte wählen --</option>
                    <option value="Einmalige Großbestellung">Einmalige Großbestellung</option>
                    <option value="Wöchentliche Anlieferung">Wöchentliche Anlieferung</option>
                    <option value="Monatliches Kontingent">Monatliches Kontingent</option>
                    <option value="Fortlaufender Rahmenvertrag">Fortlaufender Rahmenvertrag</option>
                  </select>
                </div>

                {/* Lieferort */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Lieferort / Werk</label>
                  <input
                    type="text"
                    placeholder="z.B. Werksanlieferung Leichlingen"
                    {...register("lieferort")}
                    className={inputClass}
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Gewünschte Fertigstellung (Deadline)</label>
                  <input
                    type="date"
                    {...register("deadline")}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {step === contactStep && (
            <div className="space-y-6 pb-6 animate-in fade-in-0 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vorname */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Vorname *</label>
                  <input
                    type="text"
                    placeholder="Max"
                    {...register("vorname")}
                    className={inputClass}
                  />
                  {errors.vorname && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.vorname.message}
                    </p>
                  )}
                </div>

                {/* Nachname */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Nachname *</label>
                  <input
                    type="text"
                    placeholder="Mustermann"
                    {...register("nachname")}
                    className={inputClass}
                  />
                  {errors.nachname && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.nachname.message}
                    </p>
                  )}
                </div>

                {/* Unternehmen */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Unternehmen / Firma *</label>
                  <input
                    type="text"
                    placeholder="Muster GmbH"
                    {...register("unternehmen")}
                    className={inputClass}
                  />
                  {errors.unternehmen && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.unternehmen.message}
                    </p>
                  )}
                </div>

                {/* Telefonnummer */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Telefonnummer (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+49 170 1234567"
                    {...register("telefon")}
                    className={inputClass}
                  />
                </div>

                {/* Spezifikation / Freitext */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs uppercase font-bold text-brand-navy tracking-wider">Spezifikationen / Anmerkungen (Optional)</label>
                  <textarea
                    placeholder="Teilen Sie uns hier gerne weitere Details zu Ihrem Projekt mit (z.B. geplantes Trägerfahrzeug, Maße, Sonderwünsche)."
                    rows={3}
                    {...register("spezifikation")}
                    className="w-full border border-brand-grey/30 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan bg-white p-3 text-base rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* DSGVO-Einwilligung */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    {...register("datenschutz_akzeptiert", { onChange: () => trigger("datenschutz_akzeptiert") })}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-brand-grey/30 text-brand-cyan focus:ring-brand-cyan accent-brand-cyan"
                  />
                  <span className="text-sm text-brand-grey leading-relaxed">
                    Ich habe die{" "}
                    <Link href="/datenschutz" target="_blank" className="text-brand-cyan underline font-semibold hover:text-brand-navy">
                      Datenschutzerklärung
                    </Link>{" "}
                    gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu. *
                  </span>
                </label>
                {errors.datenschutz_akzeptiert && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.datenschutz_akzeptiert.message}
                  </p>
                )}
              </div>

              {/* Honeypot: für echte Nutzer unsichtbar, Bots füllen das Feld erfahrungsgemäß aus */}
              <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("website")}
                />
              </div>

              {/* Hidden Tracking Fields */}
              <input type="hidden" value="aufbau" {...register("offer_type" as any)} />
              <input type="hidden" value={leadType === "paket" ? "B2B-Hersteller-Pfad" : "Standard-Express-Pfad"} {...register("lead_path" as any)} />
            </div>
          )}
        </div>

        {/* FOOTER (fixed, non-scrolling): Navigation, immer sichtbar */}
        <div className="relative z-10 shrink-0 bg-white border-t border-brand-grey/10 px-6 py-4 md:px-10">
          {step === 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="min-h-11 w-full sm:w-auto bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base h-12 px-8 rounded-xl shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 flex items-center justify-center gap-2"
              >
                <span>Weiter zu Schritt {step + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {isPaket && step === 2 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="min-h-11 w-full sm:w-auto border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-semibold text-base h-12 px-8 rounded-xl transition-all active:scale-97 flex items-center justify-center"
              >
                Zurück
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="min-h-11 w-full sm:w-auto bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base h-12 px-8 rounded-xl shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 flex items-center justify-center gap-2"
              >
                <span>Weiter zu Schritt {step + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === contactStep && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-11 w-full sm:w-auto border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-semibold text-base h-12 px-8 rounded-xl transition-all active:scale-97 flex items-center justify-center"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 w-full sm:w-auto bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base h-12 px-8 rounded-xl shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Wird gesendet..." : "Express-Angebot jetzt anfordern"}</span>
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-center text-xs text-brand-grey">
                Unverbindlich. Antwort innerhalb von 24h.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
