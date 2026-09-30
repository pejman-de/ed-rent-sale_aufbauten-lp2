import { createRoot } from "react-dom/client";
import App from "./App";
// Inter lokal ausliefern statt von fonts.googleapis.com. Das Nachladen von
// Google-Servern ohne Einwilligung ist unzulaessig (LG Muenchen I, 3 O 17493/20).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
