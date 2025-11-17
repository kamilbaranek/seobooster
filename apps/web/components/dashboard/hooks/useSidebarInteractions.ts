import { RefObject, useEffect } from "react";
import { positionDropdown } from "../utils/positionDropdown";

const useSidebarInteractions = (menuRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const root = menuRef.current;
    if (!root) {
      return;
    }

    const sidebarMenu = root.querySelector<HTMLElement>("#kt_aside_menu");
    if (!sidebarMenu) {
      return;
    }

    const hoverBindings: Array<{
      item: HTMLElement;
      enter: () => void;
      leave: () => void;
    }> = [];
    const accordionBindings: Array<{
      link: HTMLElement;
      handler: (e: Event) => void;
    }> = [];
    const hoverTimeouts = new Map<HTMLElement, number>();

    const showItem = (item: HTMLElement) => {
      const sub = item.querySelector<HTMLElement>(".menu-sub");
      if (!sub) return;

      item.classList.add("show", "menu-dropdown", "hover");
      sub.classList.add("show");

      positionDropdown(
        item,
        sub,
        item.getAttribute("data-kt-menu-placement") ?? "right-start",
        item.getAttribute("data-kt-menu-offset"),
      );
    };

    const hideItem = (item: HTMLElement) => {
      const sub = item.querySelector<HTMLElement>(".menu-sub");
      item.classList.remove("show", "menu-dropdown", "hover");
      if (sub) sub.classList.remove("show");
    };

    const items = Array.from(
      sidebarMenu.querySelectorAll<HTMLElement>("[data-kt-menu-trigger]"),
    );
    items.forEach((item) => {
      const trigger = item.getAttribute("data-kt-menu-trigger") ?? "";
      if (!trigger.includes("hover")) return;

      const onEnter = () => {
        const timeoutId = hoverTimeouts.get(item);
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          hoverTimeouts.delete(item);
        }
        showItem(item);
      };

      const onLeave = () => {
        const id = window.setTimeout(() => {
          hideItem(item);
          hoverTimeouts.delete(item);
        }, 200);
        hoverTimeouts.set(item, id);
      };

      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);
      hoverBindings.push({ item, enter: onEnter, leave: onLeave });
    });

    const accordionItems = Array.from(
      sidebarMenu.querySelectorAll<HTMLElement>(
        '.menu-item.menu-accordion[data-kt-menu-trigger="click"]',
      ),
    );

    accordionItems.forEach((item) => {
      const link = item.querySelector<HTMLElement>(".menu-link");
      const sub = item.querySelector<HTMLElement>(
        ".menu-sub.menu-sub-accordion",
      );

      if (!link || !sub) {
        return;
      }

      const handler = (event: Event) => {
        event.preventDefault();
        const isShown = item.classList.contains("show");
        const parent = item.parentElement;

        if (parent) {
          parent
            .querySelectorAll<HTMLElement>(".menu-item.menu-accordion.show")
            .forEach((openItem) => {
              if (openItem === item) return;
              openItem.classList.remove("show");
              const openSub = openItem.querySelector<HTMLElement>(
                ".menu-sub.menu-sub-accordion",
              );
              openSub?.classList.remove("show");
            });
        }

        if (isShown) {
          item.classList.remove("show");
          sub.classList.remove("show");
        } else {
          item.classList.add("show");
          sub.classList.add("show");
        }
      };

      link.addEventListener("click", handler);
      accordionBindings.push({ link, handler });
    });

    return () => {
      hoverBindings.forEach(({ item, enter, leave }) => {
        item.removeEventListener("mouseenter", enter);
        item.removeEventListener("mouseleave", leave);
      });
      hoverTimeouts.forEach((id) => window.clearTimeout(id));
      accordionBindings.forEach(({ link, handler }) => {
        link.removeEventListener("click", handler);
      });
    };
  }, [menuRef]);
};

export default useSidebarInteractions;
