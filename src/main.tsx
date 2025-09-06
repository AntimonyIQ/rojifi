import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// import { Toaster } from "@/v1/components/ui/toaster";
import { TooltipProvider } from "@/v1/components/ui/tooltip";
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <TooltipProvider>
            <App />
            <Toaster richColors />
        </TooltipProvider>
    </HelmetProvider>
);
