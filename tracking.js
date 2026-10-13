(() => {
  /* ============================================================
     SITE / ANALYTICS CONFIG
     Replace YOUR-DOMAIN.com in this file, robots.txt, sitemap.xml,
     and every <link rel="canonical"> / JSON-LD url when the live
     domain is confirmed. Search the repo for: YOUR-DOMAIN.com

     TODO (client accounts): paste real IDs below. Leave unused
     values as empty strings. Do not invent IDs.
     Prefer Google Tag Manager if the client uses it — when a GTM
     container ID is set, gtag is not loaded separately, so events
     are not double-fired.
     ============================================================ */
  const CONFIG = {
    siteOrigin: "https://YOUR-DOMAIN.com",

    /* TODO: Google Tag Manager container, e.g. "GTM-XXXXXXX" */
    gtmContainerId: "",

    /* TODO: GA4 measurement ID, e.g. "G-XXXXXXXXXX"
       Skip if GA4 is already installed inside GTM. */
    ga4MeasurementId: "",

    /* TODO: Google Ads account ID, e.g. "AW-XXXXXXXXX"
       Skip if Ads tags are already installed inside GTM. */
    googleAdsId: "",

    /* TODO: Ads conversion labels only (not full send_to strings) */
    quoteConversionLabel: "",
    callConversionLabel: "",
  };

  window.STAIN_STEAMER_CONFIG = CONFIG;
  window.dataLayer = window.dataLayer || [];

  const PLACEHOLDER = /^(GTM-XXXXXXX|G-XXXXXXXXXX|AW-XXXXXXXXX|)$/;
  const gtmId = String(CONFIG.gtmContainerId || "").trim();
  const ga4Id = String(CONFIG.ga4MeasurementId || "").trim();
  const adsId = String(CONFIG.googleAdsId || "").trim();
  const useGtm = Boolean(gtmId) && !PLACEHOLDER.test(gtmId);
  const useGa4 = Boolean(ga4Id) && !PLACEHOLDER.test(ga4Id);
  const useAds = Boolean(adsId) && !PLACEHOLDER.test(adsId);

  const gtagStub = function () {
    window.dataLayer.push(arguments);
  };

  const loadScript = (src) => {
    const el = document.createElement("script");
    el.async = true;
    el.src = src;
    document.head.appendChild(el);
  };

  if (useGtm) {
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });
    loadScript(
      "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(gtmId)
    );
  } else if (useGa4 || useAds) {
    window.gtag = window.gtag || gtagStub;
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(useGa4 ? ga4Id : adsId));
    window.gtag("js", new Date());
    if (useGa4) window.gtag("config", ga4Id, { send_page_view: true });
    if (useAds) window.gtag("config", adsId);
  }

  const fired = {
    quote: false,
  };

  const pushEvent = (name, extra) => {
    window.dataLayer.push(Object.assign({ event: name }, extra || {}));
  };

  const sendAdsConversion = (label) => {
    const cleanLabel = String(label || "").trim();
    if (!useAds || !cleanLabel || useGtm) return;
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "conversion", {
      send_to: adsId + "/" + cleanLabel,
    });
  };

  window.stainSteamerTrack = {
    quoteSubmitSuccess() {
      if (fired.quote) return;
      fired.quote = true;
      pushEvent("quote_request_success", { conversion_type: "quote" });
      if (!useGtm && useGa4 && typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          method: "quote_form",
        });
      }
      sendAdsConversion(CONFIG.quoteConversionLabel);
    },
    clickToCall() {
      pushEvent("click_to_call", { conversion_type: "call" });
      if (!useGtm && useGa4 && typeof window.gtag === "function") {
        window.gtag("event", "click_to_call", {
          method: "tel_link",
        });
      }
      sendAdsConversion(CONFIG.callConversionLabel);
    },
    resetQuoteFlag() {
      fired.quote = false;
    },
  };

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target && event.target.closest
        ? event.target.closest('a[href^="tel:"]')
        : null;
      if (!link) return;
      window.stainSteamerTrack.clickToCall();
    },
    true
  );
})();
