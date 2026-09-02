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
  const formNote = quoteForm.querySelector(".form-note");
  const noteDefault = formNote ? formNote.textContent : "";

  /* =====================================
       FOOTER YEAR — always current
    ===================================== */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = quoteForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Sending...";
    if (formNote) {
      formNote.textContent = noteDefault;
      formNote.style.color = "";
    }

    try {
      const formData = new FormData(quoteForm);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success — the quote request has been emailed.
        button.textContent = "✓ Request received";
        quoteForm.reset();
        if (formNote) {
          formNote.textContent =
            "Thanks! We've got your request and will be in touch shortly.";
          formNote.style.color = "var(--green-deep)";
        }
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          if (formNote) {
            formNote.textContent = noteDefault;
            formNote.style.color = "";
          }
        }, 4000);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      // Failure — let the visitor know and offer the phone number as a fallback.
      button.textContent = "Try again";
      button.disabled = false;
      if (formNote) {
        formNote.textContent =
          "Something went wrong. Please call us at 415-860-8154 instead.";
        formNote.style.color = "#c0392b";
      }
    }
  });
})();
