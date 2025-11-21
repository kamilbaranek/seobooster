import { RefObject, useEffect } from "react";
import { positionDropdown } from "../utils/positionDropdown";

const useNavbarInteractions = (navbarRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) {
      return;
    }

    const bindings: Array<{
      button: HTMLElement;
      menu: HTMLElement;
      handlers: {
        click: (event: Event) => void;
        buttonEnter?: () => void;
        buttonLeave?: () => void;
        menuEnter?: () => void;
        menuLeave?: () => void;
      };
    }> = [];

    const closeMenus = () => {
      navbar
        .querySelectorAll<HTMLElement>('[data-kt-menu="true"]')
        .forEach((menu) => menu.classList.remove("show"));
    };

    const onDocumentClick = (event: Event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (navbar.contains(event.target as Node)) {
        return;
      }
      closeMenus();
    };

    document.addEventListener("click", onDocumentClick);

    const triggers = Array.from(
      navbar.querySelectorAll<HTMLElement>("[data-kt-menu-trigger]"),
    ).filter((button) => !button.closest('[data-kt-menu="true"]'));

    triggers.forEach((button) => {
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

      const openMenu = () => {
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

      const clickHandler = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        openMenu();
      };

      button.addEventListener("click", clickHandler);

      let buttonEnter: (() => void) | undefined;
      let buttonLeave: (() => void) | undefined;
      let menuEnter: (() => void) | undefined;
      let menuLeave: (() => void) | undefined;
      let hoverTimeoutId: number | undefined;

      const triggerAttr = button.getAttribute("data-kt-menu-trigger") ?? "";
      if (triggerAttr.includes("hover")) {
        const cancelHide = () => {
          if (hoverTimeoutId) {
            window.clearTimeout(hoverTimeoutId);
            hoverTimeoutId = undefined;
          }
        };

        const startHide = () => {
          cancelHide();
          hoverTimeoutId = window.setTimeout(() => {
            menu.classList.remove("show");
          }, 200);
        };

        buttonEnter = () => {
          cancelHide();
          openMenu();
        };

        buttonLeave = () => {
          startHide();
        };

        menuEnter = () => {
          cancelHide();
        };

        menuLeave = () => {
          startHide();
        };

        button.addEventListener("mouseenter", buttonEnter);
        button.addEventListener("mouseleave", buttonLeave);
        menu.addEventListener("mouseenter", menuEnter);
        menu.addEventListener("mouseleave", menuLeave);
      }

      bindings.push({
        button,
        menu,
        handlers: {
          click: clickHandler,
          buttonEnter,
          buttonLeave,
          menuEnter,
          menuLeave,
        },
      });
    });

    return () => {
      bindings.forEach(({ button, menu, handlers }) => {
        button.removeEventListener("click", handlers.click);
        if (handlers.buttonEnter) {
          button.removeEventListener("mouseenter", handlers.buttonEnter);
        }
        if (handlers.buttonLeave) {
          button.removeEventListener("mouseleave", handlers.buttonLeave);
        }
        if (handlers.menuEnter) {
          menu.removeEventListener("mouseenter", handlers.menuEnter);
        }
        if (handlers.menuLeave) {
          menu.removeEventListener("mouseleave", handlers.menuLeave);
        }
      });
      document.removeEventListener("click", onDocumentClick);
    };
  }, [navbarRef]);
};

export default useNavbarInteractions;
