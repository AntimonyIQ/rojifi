import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// import { Toaster } from "@/v1/components/ui/toaster";
import { TooltipProvider } from "@/v1/components/ui/tooltip";
import { Toaster } from 'sonner'

createRoot(document.getElementById("root")!).render(
    <TooltipProvider>
        <App />
        <Toaster richColors />
    </TooltipProvider>
);
