document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("[data-copy-bibtex]");
  const code = document.querySelector("#bibtex-code");
  if (btn && code) {
    btn.addEventListener("click", async () => {
      const text = code.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 1600);
      } catch {
        btn.textContent = "Select manually";
      }
    });
  }

  const links = [...document.querySelectorAll(".toc a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = () => {
    const y = window.scrollY + 96;
    let current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= y) current = section;
    }
    links.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current.id}`);
    });
  };

  setActive();
  window.addEventListener("scroll", setActive, { passive: true });
});
