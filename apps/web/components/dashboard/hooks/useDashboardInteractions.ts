import { useEffect } from 'react';

const parseOffset = (raw?: string | null): { x: number; y: number } => {
    if (!raw) return { x: 0, y: 0 };
    const parts = raw.split(',').map((part) => part.trim());
    const [xStr, yStr] = [parts[0] ?? '0', parts[1] ?? '0'];
    const parse = (value: string) => {
        const num = parseFloat(value.replace('px', ''));
        return Number.isFinite(num) ? num : 0;
    };
    return { x: parse(xStr), y: parse(yStr) };
};

const positionDropdown = (
    trigger: HTMLElement,
    menu: HTMLElement,
    placementRaw?: string | null,
    offsetRaw?: string | null
) => {
    const rect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    const { x: offsetX, y: offsetY } = parseOffset(offsetRaw);

    const placement = placementRaw ?? 'bottom-end';
    const [primary, secondary] = placement.split('-') as [string, string | undefined];

    let top = rect.bottom;
    let left = rect.left;

    const width = menuRect.width || menu.offsetWidth;
    const height = menuRect.height || menu.offsetHeight;

    if (primary === 'top') {
        top = rect.top - height;
    } else if (primary === 'bottom') {
        top = rect.bottom;
    } else if (primary === 'left' || primary === 'right') {
        top = rect.top;
    }

    if (primary === 'left') {
        left = rect.left - width;
    } else if (primary === 'right') {
        left = rect.right;
    } else if (secondary === 'end') {
        left = rect.right - width;
    } else {
        left = rect.left;
    }

    top += offsetY;
    left += offsetX;

    const padding = 8;
    top = Math.min(Math.max(padding, top), innerHeight - height - padding);
    left = Math.min(Math.max(padding, left), innerWidth - width - padding);

    menu.style.position = 'fixed';
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
};

export const useDashboardInteractions = (enabled: boolean) => {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const sidebarMenu = document.getElementById('kt_aside_menu');
        const hoverBindings: Array<{ item: HTMLElement; enter: () => void; leave: () => void }> = [];
        const accordionBindings: Array<{ link: HTMLElement; handler: (e: Event) => void }> = [];
        const hoverTimeouts = new Map<HTMLElement, number>();

        const showItem = (item: HTMLElement) => {
            const sub = item.querySelector<HTMLElement>('.menu-sub');
            if (!sub) return;

            item.classList.add('show', 'menu-dropdown', 'hover');
            sub.classList.add('show');

            positionDropdown(
                item,
                sub,
                item.getAttribute('data-kt-menu-placement') ?? 'right-start',
                item.getAttribute('data-kt-menu-offset')
            );
        };

        const hideItem = (item: HTMLElement) => {
            const sub = item.querySelector<HTMLElement>('.menu-sub');
            item.classList.remove('show', 'menu-dropdown', 'hover');
            if (sub) sub.classList.remove('show');
        };

        if (sidebarMenu) {
            const items = Array.from(
                sidebarMenu.querySelectorAll<HTMLElement>('[data-kt-menu-trigger]')
            );

            items.forEach((item) => {
                const trigger = item.getAttribute('data-kt-menu-trigger') ?? '';
                if (!trigger.includes('hover')) return;

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

                item.addEventListener('mouseenter', onEnter);
                item.addEventListener('mouseleave', onLeave);
                hoverBindings.push({ item, enter: onEnter, leave: onLeave });
            });

            const accordionItems = Array.from(
                sidebarMenu.querySelectorAll<HTMLElement>('.menu-item.menu-accordion[data-kt-menu-trigger="click"]')
            );

            accordionItems.forEach((item) => {
                const link = item.querySelector<HTMLElement>('.menu-link');
                const sub = item.querySelector<HTMLElement>('.menu-sub.menu-sub-accordion');

                if (!link || !sub) {
                    return;
                }

                const handler = (event: Event) => {
                    event.preventDefault();

                    const isShown = item.classList.contains('show');
                    const parent = item.parentElement;

                    if (parent) {
                        parent
                            .querySelectorAll<HTMLElement>('.menu-item.menu-accordion.show')
                            .forEach((openItem) => {
                                if (openItem === item) return;
                                openItem.classList.remove('show');
                                const openSub = openItem.querySelector<HTMLElement>('.menu-sub.menu-sub-accordion');
                                openSub?.classList.remove('show');
                            });
                    }

                    if (isShown) {
                        item.classList.remove('show');
                        sub.classList.remove('show');
                    } else {
                        item.classList.add('show');
                        sub.classList.add('show');
                    }
                };

                link.addEventListener('click', handler);
                accordionBindings.push({ link, handler });
            });
        }

        const tabBindings: Array<{ link: HTMLAnchorElement; handler: (e: Event) => void }> = [];
        const tabLinks = Array.from(
            document.querySelectorAll<HTMLAnchorElement>('.nav [data-bs-toggle="pill"]')
        );

        tabLinks.forEach((link) => {
            const nav = link.closest('.nav');
            const container = nav?.parentElement;
            const tabContent = container?.querySelector<HTMLElement>('.tab-content');
            if (!nav || !tabContent) return;

            const handler = (event: Event) => {
                event.preventDefault();
                const href = link.getAttribute('href') ?? '';
                const targetId = href.startsWith('#') ? href.slice(1) : href;
                if (!targetId) return;

                const targetPane = tabContent.querySelector<HTMLElement>(`#${targetId}`);
                if (!targetPane) return;

                nav.querySelectorAll('.nav-link').forEach((el) => el.classList.remove('active'));
                link.classList.add('active');

                tabContent.querySelectorAll('.tab-pane').forEach((pane) => {
                    pane.classList.remove('show', 'active');
                });
                targetPane.classList.add('show', 'active');
            };

            link.addEventListener('click', handler);
            tabBindings.push({ link, handler });
        });

        const toolbarBindings: Array<{ button: HTMLElement; handler: (e: Event) => void }> = [];
        const sidebarMenuBindings: Array<{ button: HTMLElement; handler: (e: Event) => void }> = [];
        const navbarMenuBindings: Array<{
            button: HTMLElement;
            menu: HTMLElement;
            handlers: {
                click: (e: Event) => void;
                buttonEnter?: () => void;
                buttonLeave?: () => void;
                menuEnter?: () => void;
                menuLeave?: () => void;
            };
        }> = [];

        const closeDropdownMenus = () => {
            document
                .querySelectorAll<HTMLElement>(
                    '.card-toolbar [data-kt-menu="true"], #kt_app_sidebar_footer [data-kt-menu="true"], .app-navbar-item [data-kt-menu="true"]'
                )
                .forEach((menu) => menu.classList.remove('show'));
        };

        const onDocumentClick = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            if (
                target.closest('.card-toolbar') ||
                target.closest('#kt_app_sidebar_footer') ||
                target.closest('.app-navbar-item')
            ) {
                return;
            }
            closeDropdownMenus();
        };

        document.addEventListener('click', onDocumentClick);

        const onTriggerClick = (event: Event) => {
            const target = event.target as HTMLElement;
            const trigger = target.closest('[data-kt-menu-trigger="click"]') as HTMLElement | null;

            if (!trigger) return;

            // Skip if handled by other specific logic
            if (
                trigger.closest('.app-navbar-item') ||
                trigger.closest('#kt_aside_menu') ||
                trigger.closest('#kt_app_sidebar_footer')
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const sibling = trigger.nextElementSibling as HTMLElement | null;
            const menu =
                sibling && sibling.matches('[data-kt-menu="true"]')
                    ? sibling
                    : (trigger.parentElement?.querySelector<HTMLElement>('[data-kt-menu="true"]') ?? null);

            if (!menu) return;

            const isShown = menu.classList.contains('show');
            closeDropdownMenus();

            if (!isShown) {
                menu.classList.add('show');
                positionDropdown(
                    trigger,
                    menu,
                    trigger.getAttribute('data-kt-menu-placement') ?? 'bottom-end',
                    trigger.getAttribute('data-kt-menu-offset')
                );
            }
        };

        document.addEventListener('click', onTriggerClick);

        const sidebarFooter = document.getElementById('kt_app_sidebar_footer');
        if (sidebarFooter) {
            const sidebarTrigger = sidebarFooter.querySelector<HTMLElement>('[data-kt-menu-trigger]');
            const sidebarMenu = sidebarFooter.querySelector<HTMLElement>('[data-kt-menu="true"]');

            if (sidebarTrigger && sidebarMenu) {
                const handler = (event: Event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const isShown = sidebarMenu.classList.contains('show');
                    closeDropdownMenus();
                    if (!isShown) {
                        sidebarMenu.classList.add('show');
                        positionDropdown(
                            sidebarTrigger,
                            sidebarMenu,
                            sidebarTrigger.getAttribute('data-kt-menu-placement') ?? 'top-start',
                            sidebarTrigger.getAttribute('data-kt-menu-offset')
                        );
                    }
                };

                sidebarTrigger.addEventListener('click', handler);
                sidebarMenuBindings.push({ button: sidebarTrigger, handler });
            }
        }

        const navbarTriggers = Array.from(
            document.querySelectorAll<HTMLElement>('.app-navbar-item [data-kt-menu-trigger]')
        ).filter((button) => !button.closest('[data-kt-menu="true"]'));

        navbarTriggers.forEach((button) => {
            const sibling = button.nextElementSibling as HTMLElement | null;
            const menu =
                sibling && sibling.matches('[data-kt-menu="true"]')
                    ? sibling
                    : (button.parentElement?.querySelector<HTMLElement>('[data-kt-menu="true"]') ?? null);

            if (!menu) {
                return;
            }

            const triggerAttr = button.getAttribute('data-kt-menu-trigger') ?? '';
            const supportsHover = triggerAttr.includes('hover');

            const openMenu = () => {
                const isShown = menu.classList.contains('show');
                closeDropdownMenus();
                if (!isShown) {
                    menu.classList.add('show');
                    positionDropdown(
                        button,
                        menu,
                        button.getAttribute('data-kt-menu-placement') ?? 'bottom-end',
                        button.getAttribute('data-kt-menu-offset')
                    );
                }
            };

            const clickHandler = (event: Event) => {
                event.preventDefault();
                event.stopPropagation();

                openMenu();
            };

            button.addEventListener('click', clickHandler);

            let buttonEnter: (() => void) | undefined;
            let buttonLeave: (() => void) | undefined;
            let menuEnter: (() => void) | undefined;
            let menuLeave: (() => void) | undefined;
            let hoverTimeoutId: number | undefined;

            if (supportsHover) {
                const cancelHide = () => {
                    if (hoverTimeoutId) {
                        window.clearTimeout(hoverTimeoutId);
                        hoverTimeoutId = undefined;
                    }
                };

                const startHide = () => {
                    cancelHide();
                    hoverTimeoutId = window.setTimeout(() => {
                        menu.classList.remove('show');
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

                button.addEventListener('mouseenter', buttonEnter);
                button.addEventListener('mouseleave', buttonLeave);
                menu.addEventListener('mouseenter', menuEnter);
                menu.addEventListener('mouseleave', menuLeave);
            }

            navbarMenuBindings.push({
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

        const themeBindings: Array<{ link: HTMLAnchorElement; handler: (e: Event) => void }> = [];

        const themeMenu = document.querySelector<HTMLElement>('[data-kt-element="theme-mode-menu"]');

        if (themeMenu) {
            const themeLinks = Array.from(
                themeMenu.querySelectorAll<HTMLAnchorElement>('[data-kt-element="mode"]')
            );

            const getSystemTheme = () =>
                window.matchMedia &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';

            const getStoredMenuMode = () => {
                const attr = document.documentElement.getAttribute('data-bs-theme-mode');
                if (attr) return attr;
                const stored = typeof window !== 'undefined'
                    ? window.localStorage.getItem('data-bs-theme-mode')
                    : null;
                return stored || 'light';
            };

            const setTheme = (menuMode: string) => {
                let theme = menuMode;
                if (menuMode === 'system') {
                    theme = getSystemTheme();
                }

                document.documentElement.setAttribute('data-bs-theme', theme);
                document.documentElement.setAttribute('data-bs-theme-mode', menuMode);

                try {
                    window.localStorage.setItem('data-bs-theme', theme);
                    window.localStorage.setItem('data-bs-theme-mode', menuMode);
                } catch {
                    // ignore storage errors
                }

                themeLinks.forEach((link) => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('data-kt-value') === menuMode
                    );
                });
            };

            // initial state based on stored mode
            setTheme(getStoredMenuMode());

            themeLinks.forEach((link) => {
                const handler = (event: Event) => {
                    event.preventDefault();
                    const value = link.getAttribute('data-kt-value') || 'light';
                    setTheme(value);
                };

                link.addEventListener('click', handler);
                themeBindings.push({ link, handler });
            });
        }

        return () => {
            hoverBindings.forEach(({ item, enter, leave }) => {
                item.removeEventListener('mouseenter', enter);
                item.removeEventListener('mouseleave', leave);
            });
            hoverTimeouts.forEach((id) => window.clearTimeout(id));

            accordionBindings.forEach(({ link, handler }) => {
                link.removeEventListener('click', handler);
            });

            tabBindings.forEach(({ link, handler }) => {
                link.removeEventListener('click', handler);
            });

            toolbarBindings.forEach(({ button, handler }) => {
                button.removeEventListener('click', handler);
            });
            sidebarMenuBindings.forEach(({ button, handler }) => {
                button.removeEventListener('click', handler);
            });
            navbarMenuBindings.forEach(({ button, menu, handlers }) => {
                button.removeEventListener('click', handlers.click);
                if (handlers.buttonEnter) {
                    button.removeEventListener('mouseenter', handlers.buttonEnter);
                }
                if (handlers.buttonLeave) {
                    button.removeEventListener('mouseleave', handlers.buttonLeave);
                }
                if (handlers.menuEnter) {
                    menu.removeEventListener('mouseenter', handlers.menuEnter);
                }
                if (handlers.menuLeave) {
                    menu.removeEventListener('mouseleave', handlers.menuLeave);
                }
            });
            document.removeEventListener('click', onDocumentClick);
            document.removeEventListener('click', onTriggerClick);

            themeBindings.forEach(({ link, handler }) => {
                link.removeEventListener('click', handler);
            });
        };
    }, [enabled]);
};
