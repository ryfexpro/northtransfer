import React from "react";
import {createRoot} from "react-dom/client";
import {TransferGardaPage} from "./Home";
import {SeoRoute} from "./components/SeoRoute";
import "./components/scroll-scrub.css";
import "./site.css";
const p=location.pathname.replace(/\/$/,"")||"/";
const pages:Record<string,React.ReactNode>={
"/transfer-aeroporto-verona-lago-di-garda":<SeoRoute airport="Aeroporto di Verona (VRN)" title="Transfer Aeroporto Verona Lago di Garda" intro="North Transfer offre transfer privati con autista NCC dall’Aeroporto di Verona al Lago di Garda."/>,
"/transfer-aeroporto-bergamo-lago-di-garda":<SeoRoute airport="Aeroporto di Bergamo Orio al Serio (BGY)" title="Transfer Aeroporto Bergamo Lago di Garda" intro="North Transfer offre transfer privati con autista NCC dall’Aeroporto di Bergamo al Lago di Garda."/>,
"/transfer-malpensa-lago-di-garda":<SeoRoute airport="Aeroporto di Milano Malpensa (MXP)" title="Transfer Malpensa Lago di Garda" intro="North Transfer collega Milano Malpensa al Lago di Garda con transfer privati NCC."/>,
"/transfer-venezia-lago-di-garda":<SeoRoute airport="Aeroporto di Venezia Marco Polo (VCE)" title="Transfer Venezia Lago di Garda" intro="North Transfer offre collegamenti privati NCC da Venezia Marco Polo al Lago di Garda."/>};
const node=p==="/en"?<TransferGardaPage initialLang="en"/>:(pages[p]??<TransferGardaPage initialLang="it"/>);
createRoot(document.getElementById("root")!).render(<React.StrictMode>{node}</React.StrictMode>);
