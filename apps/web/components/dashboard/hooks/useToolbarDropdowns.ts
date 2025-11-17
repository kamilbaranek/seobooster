import { RefObject, useEffect } from "react";
import { positionDropdown } from "../utils/positionDropdown";

const useToolbarDropdowns = (contentRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const root = contentRef.current;
    if (!root) {
      return;
    }

    const tabBindings: Array<{
      link: HTMLAnchorElement;
      handler: (event: Event) => void;
    }> = [];
    const dropdownBindings: Array<{
      button: HTMLElement;
      handler: (event: Event) => void;
    }> = [];

    const closeMenus = () => {
      root
        .querySelectorAll<HTMLElement>('.card-toolbar [data-kt-menu="true"]')
        .forEach((menu) => menu.classList.remove("show"));
    };

    const onDocumentClick = (event: Event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (root.contains(event.target)) {
        return;
      }

      closeMenus();
    };

    document.addEventListener("click", onDocumentClick);

    const tabLinks = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.nav [data-bs-toggle="pill"]'),
    );

    tabLinks.forEach((link) => {
      const nav = link.closest(".nav");
      const container = nav?.parentElement;
      const tabContent = container?.querySelector<HTMLElement>(".tab-content");
      if (!nav || !tabContent) return;

      const handler = (event: Event) => {
        event.preventDefault();
        const href = link.getAttribute("href") ?? "";
        const targetId = href.startsWith("#") ? href.slice(1) : href;
        if (!targetId) return;

        const targetPane = tabContent.querySelector<HTMLElement>(
          `#${targetId}`,
        );
        if (!targetPane) return;

        nav
          .querySelectorAll(".nav-link")
          .forEach((el) => el.classList.remove("active"));
        link.classList.add("active");

        tabContent.querySelectorAll(".tab-pane").forEach((pane) => {
          pane.classList.remove("show", "active");
        });
        targetPane.classList.add("show", "active");
      };

      link.addEventListener("click", handler);
      tabBindings.push({ link, handler });
    });

    const toolbarTriggers = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".card-toolbar [data-kt-menu-trigger]",
      ),
    );

    toolbarTriggers.forEach((button) => {
      const sibling = button.nextElementSibling as HTMLElement | null;
      const menu =
        sibling && sibling.matches('[data-kt-menu="true"]')
          ? sibling
          : (button.parentElement?.querySelector<HTMLElement>(
              '[data-kt-menu="true"]',
            ) ?? null);

      if (!menu) {
        return;
      }

      const handler = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        const isShown = menu.classList.contains("show");
        closeMenus();
        if (!isShown) {
          menu.classList.add("show");
          positionDropdown(
            button,
            menu,
            button.getAttribute("data-kt-menu-placement") ?? "bottom-end",
            button.getAttribute("data-kt-menu-offset"),
          );
        }
      };

      button.addEventListener("click", handler);
      dropdownBindings.push({ button, handler });
    });

    return () => {
      tabBindings.forEach(({ link, handler }) => {
        link.removeEventListener("click", handler);
      });
      dropdownBindings.forEach(({ button, handler }) => {
        button.removeEventListener("click", handler);
      });
      document.removeEventListener("click", onDocumentClick);
    };
  }, [contentRef]);
};

export default useToolbarDropdowns;
