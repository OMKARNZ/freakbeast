import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SoundSettingsProvider } from "./contexts/SoundSettingsContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <SoundSettingsProvider>
      <App />
    </SoundSettingsProvider>
  </ThemeProvider>
);
