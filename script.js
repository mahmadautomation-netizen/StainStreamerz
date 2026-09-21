(() => {
  /* =====================================
       MOBILE MENU
    ===================================== */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  /* Close mobile menu after clicking a link */
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* =====================================
       SERVICES DROPDOWN
    ===================================== */
  const dropdowns = document.querySelectorAll(".has-dropdown");

  const closeAllDropdowns = () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("open");
      const toggle = dropdown.querySelector(".nav-drop-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  };

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-drop-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains("open");
      closeAllDropdowns();
      dropdown.classList.toggle("open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", closeAllDropdowns);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllDropdowns();
  });

  /* Close mobile menu if the window grows to desktop size */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* =====================================
       FAQ ACCORDION
    ===================================== */
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentElement;
      const wasActive = item.classList.contains("active");

      /* Close every FAQ */
      document.querySelectorAll(".faq-item").forEach((faq) => {
        faq.classList.remove("active");
        const icon = faq.querySelector(".faq-question span");
        if (icon) icon.textContent = "+";
      });

      /* Open the selected one */
      if (!wasActive) {
        item.classList.add("active");
        const icon = question.querySelector("span");
        if (icon) icon.textContent = "−";
      }
    });
  });

  /* =====================================
       SCROLL REVEAL ANIMATIONS
    ===================================== */
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("visible");
    });
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  /* =====================================
       QUOTE FORM
    ===================================== */
  const quoteForm = document.getElementById("quoteForm");
  const formNote = quoteForm ? quoteForm.querySelector(".form-note") : null;
  const noteDefault = formNote ? formNote.textContent : "";

  /* =====================================
       FOOTER YEAR — always current
    ===================================== */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (quoteForm) quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = quoteForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    const keyInput = quoteForm.querySelector('input[name="access_key"]');
    const accessKey = keyInput ? keyInput.value.trim() : "";
    const hasAccessKey =
      accessKey && accessKey !== "PASTE_YOUR_ACCESS_KEY_HERE";

    const setNote = (text, color) => {
      if (!formNote) return;
      formNote.textContent = text;
      formNote.style.color = color || "";
    };

    button.disabled = true;
    button.textContent = "Sending...";
    setNote(noteDefault, "");

    const formData = new FormData(quoteForm);
    const getField = (name) => (formData.get(name) || "").toString().trim();

    const sendByMail = () => {
      const subject = encodeURIComponent(
        "New quote request — Stain Steamer website"
      );
      const body = encodeURIComponent(
        [
          `Name: ${getField("name")}`,
          `Phone: ${getField("phone")}`,
          `Email: ${getField("email")}`,
          `ZIP: ${getField("zip")}`,
          `Service: ${getField("service")}`,
          `Timeline: ${getField("timeline")}`,
          "",
          getField("details"),
        ].join("\n")
      );
      window.location.href = `mailto:stainsteamer@yahoo.com?subject=${subject}&body=${body}`;
      button.textContent = "✓ Opening email";
      setNote(
        "Your email app should open with the request. If it doesn’t, call 415-860-8154.",
        "var(--green-deep)"
      );
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 4000);
    };

    if (!hasAccessKey) {
      sendByMail();
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        button.textContent = "✓ Request received";
        quoteForm.reset();
        setNote(
          "Thanks! We've got your request and will be in touch shortly.",
          "var(--green-deep)"
        );
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          setNote(noteDefault, "");
        }, 4000);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      sendByMail();
    }
  });

  /* =====================================
       BEFORE / AFTER COMPARISON SLIDERS
    ===================================== */
  const sliders = document.querySelectorAll(".before-after-slider");

  sliders.forEach((slider) => {
    const range = slider.querySelector(".slider-range");
    const beforeImg = slider.querySelector(".before-img");
    const handle = slider.querySelector(".slider-handle");
    let isDragging = false;

    const updateSlider = (percent) => {
      const clamped = Math.max(0, Math.min(100, Math.round(percent * 10) / 10));
      slider.style.setProperty("--slider-pos", `${clamped}%`);
      if (beforeImg) {
        beforeImg.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
        beforeImg.style.webkitClipPath = `inset(0 ${100 - clamped}% 0 0)`;
      }
      if (handle) {
        handle.style.left = `${clamped}%`;
      }
      if (range && Math.abs(parseFloat(range.value) - clamped) > 0.5) {
        range.value = clamped;
      }
    };

    const getPercentage = (clientX) => {
      const rect = slider.getBoundingClientRect();
      if (rect.width <= 0) return 50;
      const x = clientX - rect.left;
      return (x / rect.width) * 100;
    };

    // Initialize position directly
    updateSlider(50);

    // Keyboard navigation and native range events
    if (range) {
      range.addEventListener("input", (e) => {
        updateSlider(parseFloat(e.target.value));
      });
    }

    // Touch and mouse pointer dragging
    const onPointerMove = (e) => {
      if (!isDragging) return;
      updateSlider(getPercentage(e.clientX));
    };

    const onPointerEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove("is-dragging");
      try {
        if (e && e.pointerId) {
          slider.releasePointerCapture(e.pointerId);
        }
      } catch (err) {
        // Safe fallback
      }
    };

    slider.addEventListener("pointerdown", (e) => {
      // Allow touch, pen, or primary mouse click (button 0)
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDragging = true;
      slider.classList.add("is-dragging");
      updateSlider(getPercentage(e.clientX));
      try {
        slider.setPointerCapture(e.pointerId);
      } catch (err) {
        // Safe fallback
      }
    });

    slider.addEventListener("pointermove", onPointerMove);
    slider.addEventListener("pointerup", onPointerEnd);
    slider.addEventListener("pointercancel", onPointerEnd);
  });
})();
