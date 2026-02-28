import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SoundSettingsProvider } from "./contexts/SoundSettingsContext";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <SoundSettingsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SoundSettingsProvider>
  </ThemeProvider>
);
