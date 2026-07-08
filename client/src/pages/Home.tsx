import { useState } from "react";
import {
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Layers,
  ShieldCheck,
  Clock,
  Zap,
  TrendingUp,
  HelpCircle,
  Truck,
  FileText,
  UserCheck,
  Building2,
  PackageOpen
} from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLeadFormModal } from "@/contexts/LeadFormModalContext";
import { trackClick, trackFaqToggle } from "@/lib/analytics";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import { useSectionView } from "@/hooks/useSectionView";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { openLeadForm } = useLeadFormModal();
  useScrollDepth();

  const manufacturersRef = useSectionView<HTMLElement>("manufacturers_section");
  const categoriesRef = useSectionView<HTMLElement>("categories_section");
  const processRef = useSectionView<HTMLElement>("process_metrics_section");
  const dealerRef = useSectionView<HTMLElement>("dealer_framework_section");
  const proofRef = useSectionView<HTMLElement>("proof_block_section");
  const faqRef = useSectionView<HTMLElement>("faq_section");

  const toggleFaq = (index: number) => {
    const opening = activeFaq !== index;
    trackFaqToggle(faqs[index]?.q ?? `faq_${index}`, opening);
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Image assets (Compressed webp variants for faster loading)
  const chassisImg = "/images/truck-chassis.webp";
  const finishedImg = "/images/truck-finished.webp";
  const kipperImg = "/images/kipper-truck.webp";
  const pritscheImg = "/images/pritsche-truck.webp";
  const kofferImg = "/images/koffer-truck.webp";
  const spezialImg = "/images/spezial-truck.webp";

  // Manufacturer logos
  const manufacturers = [
    { name: "Mercedes-Benz", desc: "Atego, Actros, Sprinter" },
    { name: "MAN", desc: "TGL, TGM, TGE" },
    { name: "Iveco", desc: "Daily, Eurocargo" },
    { name: "Scania", desc: "P-Serie, G-Serie" },
    { name: "Volvo", desc: "FL, FE, FM" },
    { name: "Renault", desc: "Master, D-Range" }
  ];

  const categories = [
    {
      title: "Dreiseitenkipper",
      desc: "Extrem robuste Kipperaufbauten mit Hardox-Stahl oder Aluminium-Bordwänden. Gebaut für alles, was schwer und schmutzig ist.",
      features: ["Hardox-Bodenplatte", "Starke Hydraulik", "Pendelbordwand"],
      img: kipperImg,
      tag: "Kipper"
    },
    {
      title: "Kofferaufbau",
      desc: "Isolierte oder Standard-Kofferaufbauten für Trockenfracht und Logistik. Leichtbauweise für maximale Nutzlast.",
      features: ["GFK-Sandwichpaneele", "Zurrschienen-System", "Ladebordwand-Option"],
      img: kofferImg,
      tag: "Kofferaufbau"
    },
    {
      title: "Pritsche / Bordwand",
      desc: "Universelle Pritschenaufbauten mit robusten, abklappbaren Aluminium-Bordwänden. Perfekt für den Baustofftransport.",
      features: ["Alu-Bordwände", "Stirnwandgitter", "Zurrringe im Rahmen"],
      img: pritscheImg,
      tag: "Pritsche"
    },
    {
      title: "Spezialaufbauten",
      desc: "Maßgeschneiderte Sonderlösungen für Kommunen, Energieversorger oder Schwerlast. Exakt nach CAD-Vorgabe.",
      features: ["CAD-Sonderkonstruktion", "Spezial-Hydraulik", "Individueller Innenausbau"],
      img: spezialImg,
      tag: "Spezial"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Express-Konfiguration",
      desc: "Sie wählen Aufbauart und Stückzahl und teilen uns mit, ob ein Fahrgestell schon bereitsteht."
    },
    {
      step: "02",
      title: "Technische Prüfung",
      desc: "Unser Ingenieursteam prüft die CAD-Kompatibilität mit Ihrem Fahrgestell innerhalb von 24 Stunden."
    },
    {
      step: "03",
      title: "Takt-Einplanung",
      desc: "Ihr Fahrzeug bekommt einen festen Platz in unserer Montagelinie. Keine Wartezeiten, präziser Slot."
    },
    {
      step: "04",
      title: "Auslieferung & TÜV",
      desc: "Nach 2-3 Tagen verlässt das fertige Fahrzeug inklusive Vollabnahme unser Werk."
    }
  ];

  const metrics = [
    { value: "2-3", unit: "Tage", label: "Montagezeit pro Fahrzeug" },
    { value: "bis 80", unit: "Aufbauten", label: "Kapazität pro Monat" },
    { value: "3 Mon.", unit: "Vorsprung", label: "Gegenüber herkömmlichen Herstellern" },
    { value: "1", unit: "Ansprechpartner", label: "Vom CAD-Entwurf bis zur TÜV-Abnahme" }
  ];

  const proofCards = [
    {
      title: "Zertifizierte Schweißfachkräfte",
      desc: "Alle Tragstrukturen und Hilfsrahmen werden nach DIN EN ISO 3834-2 gefertigt. Das garantiert maximale Verwindungssteifigkeit und Langlebigkeit unter härtesten Bedingungen.",
      icon: ShieldCheck
    },
    {
      title: "Präzise CAD-Konstruktion",
      desc: "Vor Produktionsstart wird jeder Aufbau digital auf Ihrem Fahrgestell simuliert. Fehlerquellen werden im Vorfeld ausgeschlossen, um die 2-3 Tage Taktzeit zu sichern.",
      icon: Layers
    },
    {
      title: "Automotive-Standard Korrosionsschutz",
      desc: "Sämtliche Stahlteile werden im Tauchbad feuerverzinkt oder hochwertig pulverbeschichtet. Wir gewähren eine erweiterte Garantie gegen Durchrostung auf alle Hilfsrahmen.",
      icon: ShieldCheck
    }
  ];

  const faqs = [
    {
      q: "Wie realisieren Sie eine Montagezeit von nur 2-3 Tagen?",
      a: "Durch vorkonstruierte Hilfsrahmen und feste Slots in unserer Taktlinie. Ihr Fahrzeug wartet nicht, es wird gefertigt."
    },
    {
      q: "Welche Fahrgestell-Hersteller werden unterstützt?",
      a: "Alle gängigen Marken wie Mercedes-Benz, MAN, Iveco, Scania, Volvo und Renault. Andere Modelle prüfen wir auf Anfrage."
    },
    {
      q: "Was passiert, wenn ich noch kein Fahrgestell habe?",
      a: "Kein Problem. Wir liefern auf Wunsch das komplette Fahrzeug inklusive Aufbau aus einer Hand."
    },
    {
      q: "Bieten Sie auch Sonderlösungen für größere Flotten an?",
      a: "Ja. Über Rahmenverträge sichern wir Ihnen feste Kontingente und planbare Lieferzeiten für Ihre gesamte Flotte."
    }
  ];

  const scrollToCategories = () => {
    const categoriesElement = document.getElementById("categories");
    if (categoriesElement) {
      categoriesElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-navy">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-brand-light to-white">
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#6e7c950a_1px,transparent_1px),linear-gradient(to_bottom,#6e7c950a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
          
          <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-brand-navy md:text-sm">
                <span className="flex h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
                B2B EXPRESS-FERTIGUNG
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-brand-navy sm:text-5xl md:text-6xl lg:leading-[1.1]">
                Umbau in 2-3 Tagen. <br />
                <span className="block text-brand-cyan mt-1">Statt 3 Monaten.</span>
              </h1>
              
              <p className="text-lg text-brand-grey leading-relaxed md:text-xl">
                Deutschlands schnellste Taktfertigung für Nutzfahrzeug-Aufbauten. Bis zu 80 Aufbauten pro Monat in zertifizierter OEM-Qualität. Während andere noch planen, fährt Ihr Fahrzeug schon.
              </p>
              
              <p className="text-xs text-brand-grey/80 italic">
                * Gilt für vorkonstruierte Standard-Hilfsrahmen bei angeliefertem Fahrgestell.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => {
                    trackClick("cta_click", { element_id: "hero_primary_cta", element_text: "Anfrage starten", element_location: "hero" });
                    openLeadForm(undefined, "hero_primary_cta");
                  }}
                  className="w-full md:w-[341px] bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base h-12 px-8 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 flex items-center justify-center rounded-xl"
                >
                  Anfrage starten
                </button>
                <button
                  onClick={() => {
                    trackClick("link_click", { element_id: "hero_secondary_cta", element_text: "Aufbauarten ansehen", element_location: "hero", destination_url: "#categories" });
                    scrollToCategories();
                  }}
                  className="w-full md:w-[341px] inline-flex items-center justify-center border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-semibold text-base h-12 px-8 transition-all active:scale-97 rounded-xl"
                >
                  Aufbauarten ansehen
                </button>
              </div>

              {/* Trust Checkmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-brand-grey/10">
                {[
                  "TÜV-Vollabnahme inklusive",
                  "DIN EN ISO 3834-2 zertifiziert",
                  "100% CAD-passgenau"
                ].map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-brand-navy">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Before/After Image Slider */}
            <div className="lg:col-span-6 space-y-4">
              <BeforeAfterSlider 
                beforeImage={chassisImg} 
                afterImage={finishedImg} 
                beforeLabel="Fahrgestell (Rohzustand)"
                afterLabel="Fertiger Aufbau"
              />
              <div className="flex justify-between items-center px-2">
                <span className="text-xs text-brand-grey">← Fahrgestell erhalten</span>
                <span className="text-xs text-brand-cyan font-bold">In 2-3 Tagen einsatzbereit &rarr;</span>
              </div>
            </div>
          </div>
        </section>

        {/* USP Banner */}
        <section className="bg-brand-navy text-white py-16 relative overflow-hidden">
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
          
          <div className="container flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight max-w-3xl text-center md:text-left">
              Während die Konkurrenz 3 Monate plant, fährt Ihr Fahrzeug schon raus.
            </h2>
            <button 
              onClick={() => {
                trackClick("cta_click", { element_id: "usp_banner_cta", element_text: "Anfrage starten", element_location: "usp_banner" });
                openLeadForm(undefined, "usp_banner_cta");
              }}
              className="bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base h-12 px-8 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 flex items-center justify-center rounded-xl whitespace-nowrap"
            >
              Anfrage starten
            </button>
          </div>
        </section>

        {/* Social Proof Section */}
        <section ref={manufacturersRef} className="py-20 bg-brand-light border-y border-brand-grey/10">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">Kompatibilität</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl mt-1">
                Erfahrung mit Fahrzeugen führender Hersteller
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {manufacturers.map((man, idx) => (
                <div 
                  key={idx} 
                  className="group relative flex flex-col justify-between p-6 rounded-2xl border border-brand-grey/15 bg-white shadow-sm hover:shadow-xl hover:border-brand-cyan/40 hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <span className="text-lg font-bold text-brand-navy group-hover:text-brand-cyan transition-colors">
                    {man.name}
                  </span>
                  <span className="text-xs text-brand-grey font-medium mt-1 uppercase tracking-wider">
                    {man.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Selection Grid */}
        <section id="categories" ref={categoriesRef} className="py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">Portfolio</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl mt-1">
                Unsere Aufbau-Kategorien für Ihren Einsatz
              </h2>
              <p className="mt-3 text-lg text-brand-grey">
                Wählen Sie die passende Kategorie. Jeder Aufbau wird präzise für Ihr Fahrgestell gefertigt, nicht von der Stange.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((cat, idx) => (
                <div 
                  key={idx} 
                  className="group relative flex flex-col justify-between rounded-2xl border border-brand-grey/15 bg-white shadow-sm hover:shadow-xl hover:border-brand-cyan/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img 
                      src={cat.img} 
                      alt={cat.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-brand-navy text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-lg border border-white/10">
                      {cat.tag}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy">{cat.title}</h3>
                      <p className="text-sm text-brand-grey mt-2 leading-relaxed">{cat.desc}</p>
                    </div>
                    
                    <ul className="space-y-1.5 pt-2 border-t border-brand-grey/10">
                      {cat.features.map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs font-semibold text-brand-navy flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => {
                        trackClick("tile_click", {
                          element_id: `tile_${cat.tag}`,
                          element_text: "zum Formular",
                          element_location: "categories",
                          extra: { category_name: cat.tag },
                        });
                        openLeadForm(cat.tag, "category_tile");
                      }}
                      className="text-xs font-bold text-brand-navy hover:text-brand-cyan uppercase tracking-widest flex items-center gap-1 group/btn pt-2 transition-colors duration-200 cursor-pointer"
                    >
                      <span>zum Formular</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process & Metrics */}
        <section ref={processRef} className="py-20 bg-brand-light border-y border-brand-grey/10">
          <div className="container space-y-16">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((metric, idx) => (
                <div key={idx} className="group relative flex flex-col justify-between p-8 rounded-2xl border border-brand-grey/15 bg-white shadow-sm hover:shadow-xl hover:border-brand-cyan/40 hover:-translate-y-1 transition-all duration-300 text-center">
                  <div className="text-4xl font-extrabold text-brand-cyan md:text-5xl tracking-tight leading-none">
                    {metric.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-navy mt-1">
                    {metric.unit}
                  </div>
                  <p className="text-sm text-brand-grey mt-3 font-medium leading-snug">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Process Steps */}
            <div className="space-y-8">
              <div className="max-w-3xl mx-auto text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">Ablauf</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl mt-1">
                  Vom Fahrgestell zum einsatzbereiten Truck in 4 Schritten
                </h2>
                <p className="mt-3 text-lg text-brand-grey">
                  Unser strukturierter B2B-Prozess garantiert maximale Geschwindigkeit ohne Abstriche bei der Qualität.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {processSteps.map((step, idx) => (
                  <div key={idx} className="group relative flex flex-col justify-between p-8 rounded-2xl border border-brand-grey/15 bg-white shadow-sm hover:shadow-xl hover:border-brand-cyan/40 hover:-translate-y-1 transition-all duration-300">
                    <div className="text-6xl font-extrabold text-brand-cyan/10 group-hover:text-brand-cyan/20 transition-colors absolute top-4 right-6 font-display">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-brand-navy relative z-10">{step.title}</h3>
                    <p className="text-sm text-brand-grey mt-3 leading-relaxed relative z-10">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Manufacturer Path (Power-Conversion Container) */}
        <section ref={dealerRef} className="py-20 bg-white">
          <div className="container">
            <div className="bg-brand-navy text-white p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden border border-white/5">
              {/* Tech Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-white md:text-sm">
                    <Building2 className="h-3.5 w-3.5 text-brand-cyan" /> HERSTELLER & FLOTTEN-PARTNER
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                    10-50 Fahrzeuge im Rückstand? Nutzen Sie unsere Taktfertigung.
                  </h2>
                  
                  <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
                    Als OEM-Hersteller oder Großhändler leiden Sie unter den Lieferzeiten klassischer Karosseriebauer. Wir bieten Ihnen skalierbare Produktions-Slots. So fangen Sie Ihre Spitzen ab und bleiben lieferfähig.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                    <div className="space-y-1">
                      <div className="text-brand-cyan font-bold text-lg">Kontingent-Slots</div>
                      <p className="text-xs text-slate-400">Fest reservierte Kapazität für Ihre Rahmenverträge.</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-brand-cyan font-bold text-lg">CAD-Integration</div>
                      <p className="text-xs text-slate-400">Direkte Übernahme Ihrer Konstruktionsdaten in unsere Montage.</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-brand-cyan font-bold text-lg">Express-Logistik</div>
                      <p className="text-xs text-slate-400">Sammeltransporte und Werksanlieferung bundesweit.</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
                  <button 
                    onClick={() => {
                      trackClick("cta_click", {
                        element_id: "dealer_framework_cta",
                        element_text: "Rahmenvertrag anfragen",
                        element_location: "dealer_framework",
                        extra: { intended_lead_type: "paket" },
                      });
                      openLeadForm(undefined, "dealer_framework_cta");
                    }}
                    className="w-full md:w-[281px] mx-auto bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base h-12 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 flex items-center justify-center rounded-xl uppercase tracking-wider"
                  >
                    Rahmenvertrag anfragen
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Direkt-Durchwahl Großkunden: <br />
                    <a
                      href="tel:+4921758845535"
                      onClick={() =>
                        trackClick("phone_click", {
                          element_id: "dealer_framework_phone",
                          element_text: "+49 2175 8845535",
                          element_location: "dealer_framework",
                          destination_url: "tel:+4921758845535",
                        })
                      }
                      className="underline font-bold text-white hover:text-brand-cyan transition-colors"
                    >+49 2175 8845535</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Block */}
        <section ref={proofRef} className="py-20 bg-brand-light border-y border-brand-grey/10">
          <div className="container space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">Qualitätssicherung</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl mt-1">
                Zertifizierte Qualität für jeden Aufbau
              </h2>
              <p className="mt-3 text-lg text-brand-grey">
                Schnelligkeit bedeutet bei uns nicht Kompromiss, sondern Präzision. Jedes Bauteil durchläuft unsere strenge Qualitätskontrolle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {proofCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div key={idx} className="group relative flex flex-col justify-between p-8 rounded-2xl border border-brand-grey/15 bg-white shadow-sm hover:shadow-xl hover:border-brand-cyan/40 hover:-translate-y-1 transition-all duration-300">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy group-hover:bg-brand-cyan/15 group-hover:text-brand-cyan transition-colors mb-6">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-brand-navy">{card.title}</h3>
                      <p className="text-sm text-brand-grey mt-3 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Lead Form CTA Section */}
        <section className="py-20 bg-white relative">
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#6e7c950a_1px,transparent_1px),linear-gradient(to_bottom,#6e7c950a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          <div className="container max-w-3xl relative z-10">
            <div className="bg-white rounded-2xl border border-brand-grey/15 p-8 md:p-12 shadow-xl relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#6e7c950a_1px,transparent_1px),linear-gradient(to_bottom,#6e7c950a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">B2B Express-Konfigurator</span>
                <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">Jetzt Express-Angebot anfordern</h2>
                <p className="text-brand-grey text-lg max-w-xl mx-auto">
                  Präzise Taktfertigung sichert Ihren Vorsprung. Das Formular dauert 2 Minuten, wir melden uns innerhalb von 24h.
                </p>
                <button
                  onClick={() => {
                    trackClick("cta_click", { element_id: "express_offer_cta", element_text: "Express-Angebot anfordern", element_location: "lead_form_cta_section" });
                    openLeadForm(undefined, "express_offer_cta");
                  }}
                  className="bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base h-12 px-8 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 inline-flex items-center justify-center gap-2 rounded-xl"
                >
                  <span>Express-Angebot anfordern</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-20 bg-brand-light border-y border-brand-grey/10">
          <div className="container max-w-3xl space-y-12">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">FAQ</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl mt-1">
                Häufig gestellte Fragen
              </h2>
              <p className="mt-3 text-lg text-brand-grey">Alles, was Sie über unsere Express-Taktfertigung wissen müssen.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="bg-white rounded-xl border border-brand-grey/15 overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-6 flex justify-between items-center hover:bg-brand-light transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-brand-navy text-lg tracking-tight">{faq.q}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-brand-cyan transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        <div className="p-6 bg-white border-t border-brand-grey/10 text-sm text-brand-grey leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </div>
  );
}
