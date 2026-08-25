import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { generateInfographic } from "./api";
import {
  buildZip,
  dataUrlToBytes,
  defaultBrands,
  loadBrands,
  safeSlug,
  saveCustomBrand,
} from "./augmented";
import {
  campaignCopyMarkdown,
  defaultMarketingCampaign,
  marketingFormats,
  mockupOptions,
  objectiveOptions,
  renderMarketingSvg,
  svgStringToDataUrl,
  svgStringToRaster,
  templateOptions,
  toneOptions,
  type MarketingCampaign,
  type MarketingFormatId,
  type MarketingMockup,
} from "./marketing";
import { downloadBlob, downloadHref } from "./project";
import type { BrandProfile } from "./types";
import "./marketing.css";

type MarketingPanel = "brief" | "copy" | "design" | "assets" | "mockup" | "pack";
type ThemeMode = "light" | "dark";

const panelOptions: { id: MarketingPanel; number: string; label: string }[] = [
  { id: "brief", number: "01", label: "Brief" },
  { id: "copy", number: "02", label: "Message" },
  { id: "design", number: "03", label: "Direction" },
  { id: "assets", number: "04", label: "Assets" },
  { id: "mockup", number: "05", label: "Mockups" },
  { id: "pack", number: "06", label: "Campagne" },
];

function initialTheme(): ThemeMode {
  const stored = localStorage.getItem("infographic-lab-augmented-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function loadCampaign(): MarketingCampaign {
  try {
    const stored = JSON.parse(localStorage.getItem("infographic-lab-marketing-campaign-v1") ?? "null") as Partial<MarketingCampaign> | null;
    if (!stored) return { ...defaultMarketingCampaign };
    return {
      ...defaultMarketingCampaign,
      ...stored,
      benefits: Array.isArray(stored.benefits) ? stored.benefits.slice(0, 3).map(String) : defaultMarketingCampaign.benefits,
      assetDataUrl: undefined,
      assetName: undefined,
    };
  } catch {
    return { ...defaultMarketingCampaign };
  }
}

function providerBrief(campaign: MarketingCampaign) {
  return [
    "BRIEF MARKETING",
    `Objectif : ${campaign.objective}`,
    `Cible : ${campaign.target}`,
    `Offre : ${campaign.offer}`,
    `Ton : ${campaign.tone}`,
    campaign.price ? `Prix / offre : ${campaign.price}` : "",
    campaign.badge ? `Badge : ${campaign.badge}` : "",
    "Produis une accroche marketing très courte, un sous-message clair et trois bénéfices distincts. N'invente aucun chiffre ni preuve absente du brief.",
  ].filter(Boolean).join("\n");
}

export function MarketingStudio() {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [activePanel, setActivePanel] = useState<MarketingPanel>("brief");
  const [campaign, setCampaign] = useState<MarketingCampaign>(loadCampaign);
  const [formatId, setFormatId] = useState<MarketingFormatId>("linkedin-portrait");
  const [mockup, setMockup] = useState<MarketingMockup>("none");
  const [brands, setBrands] = useState<BrandProfile[]>(() => loadBrands());
  const [brand, setBrand] = useState<BrandProfile>(() => loadBrands()[0] ?? defaultBrands[0]);
  const [packFormats, setPackFormats] = useState<MarketingFormatId[]>(["linkedin-portrait", "square", "story"]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const format = marketingFormats.find((item) => item.id === formatId) ?? marketingFormats[0];
  const svg = useMemo(() => renderMarketingSvg(campaign, brand, format, mockup), [campaign, brand, format, mockup]);
  const previewRatio = mockup === "none" ? `${format.width} / ${format.height}` : "1200 / 1280";

  useEffect(() => {
    localStorage.setItem("infographic-lab-augmented-theme", theme);
  }, [theme]);

  useEffect(() => {
    const { assetDataUrl: _asset, assetName: _assetName, ...persistable } = campaign;
    localStorage.setItem("infographic-lab-marketing-campaign-v1", JSON.stringify(persistable));
  }, [campaign]);

  function updateCampaign(patch: Partial<MarketingCampaign>) {
    setCampaign((current) => ({ ...current, ...patch }));
  }

  function updateBenefit(index: number, value: string) {
    setCampaign((current) => {
      const benefits = [...current.benefits];
      benefits[index] = value.slice(0, 80);
      return { ...current, benefits };
    });
  }

  async function assistCopy() {
    setCopyLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await generateInfographic({
        text: providerBrief(campaign),
        type: "list",
        style: "clean",
        language: "fr",
        intent: "convince",
        provider: "auto",
      });
      const result = response.infographic;
      updateCampaign({
        headline: result.title,
        subheadline: result.subtitle || result.items[0]?.description || campaign.subheadline,
        benefits: result.items.slice(0, 3).map((item) => item.title).filter(Boolean),
      });
      setMessage(`Message optimisé avec ${response.provider ?? "le moteur automatique"}.`);
      setActivePanel("copy");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Assistant créatif indisponible.");
    } finally {
      setCopyLoading(false);
    }
  }

  function readAsset(file: File | null) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Utilisez un PNG, JPEG ou WebP pour l'asset marketing.");
      return;
    }
    if (file.size > 4_000_000) {
      setError("Asset trop lourd : 4 Mo maximum pour cette préversion.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateCampaign({ assetDataUrl: typeof reader.result === "string" ? reader.result : undefined, assetName: file.name });
    reader.readAsDataURL(file);
  }

  function readLogo(file: File | null) {
    if (!file) return;
    if (file.size > 500_000) {
      setError("Logo trop lourd : 500 Ko maximum.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBrand((current) => ({ ...current, logoDataUrl: typeof reader.result === "string" ? reader.result : undefined }));
    reader.readAsDataURL(file);
  }

  function saveBrand() {
    let next = brand;
    if (defaultBrands.some((item) => item.id === brand.id)) {
      next = { ...brand, id: crypto.randomUUID(), name: `${brand.name} marketing` };
      setBrand(next);
    }
    saveCustomBrand(next);
    setBrands(loadBrands());
    setMessage("Profil de marque enregistré localement.");
  }

  async function exportPng() {
    try {
      const png = await svgStringToRaster(svg, "image/png");
      downloadHref(png, `${safeSlug(campaign.name)}-${format.id}${mockup !== "none" ? `-${mockup}` : ""}.png`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Export PNG impossible.");
    }
  }

  async function exportJpg() {
    try {
      const jpg = await svgStringToRaster(svg, "image/jpeg", 0.94);
      downloadHref(jpg, `${safeSlug(campaign.name)}-${format.id}${mockup !== "none" ? `-${mockup}` : ""}.jpg`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Export JPG impossible.");
    }
  }

  function exportSvg() {
    downloadBlob(svg, "image/svg+xml;charset=utf-8", `${safeSlug(campaign.name)}-${format.id}${mockup !== "none" ? `-${mockup}` : ""}.svg`);
  }

  function togglePackFormat(id: MarketingFormatId) {
    setPackFormats((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function exportCampaignPack() {
    if (!packFormats.length) {
      setError("Sélectionnez au moins un format de campagne.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const base = safeSlug(campaign.name);
      const files: { name: string; data: string | Uint8Array }[] = [
        { name: `${base}/copy.md`, data: campaignCopyMarkdown(campaign) },
        { name: `${base}/campaign.json`, data: JSON.stringify({ ...campaign, assetDataUrl: campaign.assetDataUrl ? "embedded-in-visuals" : undefined, brand, packFormats }, null, 2) },
      ];
      for (const id of packFormats) {
        const packFormat = marketingFormats.find((item) => item.id === id);
        if (!packFormat) continue;
        const visualSvg = renderMarketingSvg(campaign, brand, packFormat, "none");
        const png = await svgStringToRaster(visualSvg, "image/png");
        files.push({ name: `${base}/${id}/${base}-${id}.svg`, data: visualSvg });
        files.push({ name: `${base}/${id}/${base}-${id}.png`, data: dataUrlToBytes(png) });
      }
      if (mockup !== "none") {
        const mockupSvg = renderMarketingSvg(campaign, brand, format, mockup);
        const mockupPng = await svgStringToRaster(mockupSvg, "image/png");
        files.push({ name: `${base}/mockups/${mockup}.svg`, data: mockupSvg });
        files.push({ name: `${base}/mockups/${mockup}.png`, data: dataUrlToBytes(mockupPng) });
      }
      downloadBlob(buildZip(files), "application/zip", `${base}-campaign-pack.zip`);
      setMessage(`Campaign Pack créé · ${packFormats.length} format(s).`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Création du Campaign Pack impossible.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="marketing-app" data-theme={theme} style={{ "--mk-accent": brand.accent, "--mk-primary": brand.primary } as CSSProperties}>
      <header className="marketing-header">
        <div className="marketing-product">
          <div className="marketing-product-mark">IL</div>
          <div><strong>Visual Campaign Studio</strong><span>Marketing · Communication · Merchandising</span></div>
        </div>
        <div className="marketing-campaign-name"><span>Campagne</span><input value={campaign.name} onChange={(event) => updateCampaign({ name: event.target.value.slice(0, 100) })} /></div>
        <div className="marketing-header-actions">
          <span className="marketing-local-pill">LOCAL RENDER</span>
          <button type="button" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}>{theme === "light" ? "☾ Sombre" : "☀ Clair"}</button>
        </div>
      </header>

      <div className="marketing-workbench">
        <aside className="marketing-inspector">
          <nav className="marketing-panel-tabs">
            {panelOptions.map((panel) => <button key={panel.id} type="button" className={activePanel === panel.id ? "active" : ""} onClick={() => setActivePanel(panel.id)}><span>{panel.number}</span>{panel.label}</button>)}
          </nav>
          <div className="marketing-inspector-scroll">
            {activePanel === "brief" && (
              <section className="marketing-panel">
                <div className="marketing-panel-title"><span>01 · BRIEF</span><h2>Cadrez la campagne</h2><p>Le message et le visuel partent d'un brief métier, pas d'un prompt vide.</p></div>
                <label><span>Objectif</span><select value={campaign.objective} onChange={(event) => updateCampaign({ objective: event.target.value as MarketingCampaign["objective"] })}>{objectiveOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label><span>Cible</span><input value={campaign.target} onChange={(event) => updateCampaign({ target: event.target.value.slice(0, 160) })} placeholder="Dirigeants, clients, collaborateurs…" /></label>
                <label><span>Offre / produit / service</span><textarea value={campaign.offer} onChange={(event) => updateCampaign({ offer: event.target.value.slice(0, 500) })} placeholder="Ce que vous voulez promouvoir" /></label>
                <div className="marketing-two-fields"><label><span>Ton</span><select value={campaign.tone} onChange={(event) => updateCampaign({ tone: event.target.value as MarketingCampaign["tone"] })}>{toneOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span>Badge</span><input value={campaign.badge ?? ""} onChange={(event) => updateCampaign({ badge: event.target.value.slice(0, 40) || undefined })} placeholder="Nouveau, Offre…" /></label></div>
                <div className="marketing-two-fields"><label><span>Prix / offre</span><input value={campaign.price ?? ""} onChange={(event) => updateCampaign({ price: event.target.value.slice(0, 32) || undefined })} placeholder="59 €, -20 %…" /></label><label><span>CTA</span><input value={campaign.cta} onChange={(event) => updateCampaign({ cta: event.target.value.slice(0, 50) })} /></label></div>
                <button type="button" className="marketing-primary" disabled={copyLoading} onClick={() => void assistCopy()}>{copyLoading ? "Direction créative…" : "Optimiser le message avec l'IA"}</button>
              </section>
            )}

            {activePanel === "copy" && (
              <section className="marketing-panel">
                <div className="marketing-panel-title"><span>02 · MESSAGE</span><h2>Travaillez l'accroche</h2><p>Le texte reste entièrement éditable après l'assistance IA.</p></div>
                <label><span>Accroche principale</span><textarea className="marketing-headline-field" value={campaign.headline} onChange={(event) => updateCampaign({ headline: event.target.value.slice(0, 150) })} /></label>
                <label><span>Sous-accroche</span><textarea value={campaign.subheadline} onChange={(event) => updateCampaign({ subheadline: event.target.value.slice(0, 260) })} /></label>
                <div className="marketing-benefits"><span>Bénéfices clés</span>{[0, 1, 2].map((index) => <label key={index}><i>0{index + 1}</i><input value={campaign.benefits[index] ?? ""} onChange={(event) => updateBenefit(index, event.target.value)} /></label>)}</div>
                <label><span>Mention / disclaimer</span><textarea value={campaign.legal ?? ""} onChange={(event) => updateCampaign({ legal: event.target.value.slice(0, 220) || undefined })} placeholder="Optionnel" /></label>
                <button type="button" className="marketing-secondary" disabled={copyLoading} onClick={() => void assistCopy()}>Reproposer le message</button>
              </section>
            )}

            {activePanel === "design" && (
              <section className="marketing-panel">
                <div className="marketing-panel-title"><span>03 · DIRECTION</span><h2>Choisissez une direction visuelle</h2><p>Cinq compositions haut niveau, responsives selon le format.</p></div>
                <div className="marketing-template-grid">{templateOptions.map((item) => <button key={item.id} type="button" className={campaign.template === item.id ? "active" : ""} onClick={() => updateCampaign({ template: item.id })}><strong>{item.label}</strong><small>{item.hint}</small></button>)}</div>
                <div className="marketing-format-section"><span>Format de travail</span><div className="marketing-format-grid">{marketingFormats.map((item) => <button key={item.id} type="button" className={formatId === item.id ? "active" : ""} onClick={() => setFormatId(item.id)}><strong>{item.label}</strong><small>{item.hint}</small></button>)}</div></div>
              </section>
            )}

            {activePanel === "assets" && (
              <section className="marketing-panel">
                <div className="marketing-panel-title"><span>04 · ASSETS</span><h2>Injectez votre marque</h2><p>Logo, palette et visuel produit restent locaux dans le navigateur.</p></div>
                <label><span>Profil de marque</span><select value={brand.id} onChange={(event) => { const next = brands.find((item) => item.id === event.target.value); if (next) setBrand(next); }}>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label><span>Nom</span><input value={brand.name} onChange={(event) => setBrand({ ...brand, name: event.target.value.slice(0, 80) })} /></label>
                <div className="marketing-color-grid"><label><span>Principale</span><input type="color" value={brand.primary} onChange={(event) => setBrand({ ...brand, primary: event.target.value })} /><small>{brand.primary}</small></label><label><span>Accent</span><input type="color" value={brand.accent} onChange={(event) => setBrand({ ...brand, accent: event.target.value })} /><small>{brand.accent}</small></label><label><span>Fond</span><input type="color" value={brand.background} onChange={(event) => setBrand({ ...brand, background: event.target.value })} /><small>{brand.background}</small></label></div>
                <label className="marketing-file"><span>Logo</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => readLogo(event.target.files?.[0] ?? null)} /></label>
                <label className="marketing-file"><span>Photo / produit / illustration</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => readAsset(event.target.files?.[0] ?? null)} />{campaign.assetName && <small>{campaign.assetName}</small>}</label>
                {campaign.assetDataUrl && <div className="marketing-asset-preview"><img src={campaign.assetDataUrl} alt="Asset campagne" /><button type="button" onClick={() => updateCampaign({ assetDataUrl: undefined, assetName: undefined })}>Retirer</button></div>}
                <button type="button" className="marketing-secondary" onClick={saveBrand}>Enregistrer le profil</button>
              </section>
            )}

            {activePanel === "mockup" && (
              <section className="marketing-panel">
                <div className="marketing-panel-title"><span>05 · MOCKUPS</span><h2>Mettez le visuel en situation</h2><p>Prévisualisations locales pour communication et merchandising.</p></div>
                <div className="marketing-mockup-grid">{mockupOptions.map((item) => <button key={item.id} type="button" className={mockup === item.id ? "active" : ""} onClick={() => setMockup(item.id)}>{item.label}</button>)}</div>
                <div className="marketing-note"><strong>Mockup vectoriel</strong><span>Il sert à valider rapidement la mise en situation. Les mockups photoréalistes génératifs seront raccordables plus tard via les moteurs image de la V3.</span></div>
              </section>
            )}

            {activePanel === "pack" && (
              <section className="marketing-panel">
                <div className="marketing-panel-title"><span>06 · CAMPAGNE</span><h2>Déclinez en un pack</h2><p>Un même message et une même identité, adaptés automatiquement aux formats choisis.</p></div>
                <div className="marketing-pack-list">{marketingFormats.map((item) => <label key={item.id} className={packFormats.includes(item.id) ? "selected" : ""}><input type="checkbox" checked={packFormats.includes(item.id)} onChange={() => togglePackFormat(item.id)} /><div><strong>{item.label}</strong><small>{item.hint} · {item.category}</small></div></label>)}</div>
                <button type="button" className="marketing-primary" disabled={exporting || !packFormats.length} onClick={() => void exportCampaignPack()}>{exporting ? "Création du Campaign Pack…" : `Exporter le Campaign Pack (${packFormats.length})`}</button>
              </section>
            )}

            {message && <p className="marketing-message ok">{message}</p>}
            {error && <p className="marketing-message error">{error}</p>}
          </div>
        </aside>

        <section className="marketing-stage">
          <div className="marketing-stage-toolbar">
            <div><span>FORMAT ACTIF</span><strong>{format.label}</strong><small>{format.hint}</small></div>
            <div className="marketing-toolbar-actions"><button type="button" onClick={() => setMockup("none")} className={mockup === "none" ? "active" : ""}>Création</button><button type="button" onClick={() => setActivePanel("mockup")} className={mockup !== "none" ? "active" : ""}>{mockup === "none" ? "Mockup" : mockup}</button></div>
          </div>
          <div className="marketing-stage-scroll">
            <div className="marketing-canvas-shell" style={{ aspectRatio: previewRatio }}>
              <div className="marketing-svg" dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
            <div className="marketing-stage-caption"><span>{campaign.template}</span><strong>{campaign.headline}</strong><small>{campaign.assetDataUrl ? "Asset intégré" : "Composition graphique sans asset"}</small></div>
          </div>
          <footer className="marketing-stage-footer">
            <div className="marketing-export-info"><span className="marketing-live-dot" /> rendu local · aucun upload du visuel</div>
            <div className="marketing-export-actions"><button type="button" onClick={exportSvg}>SVG</button><button type="button" onClick={() => void exportPng()}>PNG</button><button type="button" onClick={() => void exportJpg()}>JPG</button><button type="button" className="marketing-pack-button" onClick={() => setActivePanel("pack")}>Campaign Pack</button></div>
          </footer>
        </section>
      </div>
    </main>
  );
}
