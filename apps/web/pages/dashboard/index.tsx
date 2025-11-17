import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import { useRouter } from 'next/router';
import type { ApexOptions } from 'apexcharts';
import { getToken } from '../../lib/auth-storage';

interface DashboardTemplateProps {
  bodyHtml: string;
  bodyAttributes: Record<string, string>;
}

const frameBustingScript =
  'if (window.top !== window.self) { window.top.location.replace(window.self.location.href); }';

const themeModeScript =
  'var defaultThemeMode = "light"; var themeMode; if (document.documentElement) { if (document.documentElement.hasAttribute("data-bs-theme-mode")) { themeMode = document.documentElement.getAttribute("data-bs-theme-mode"); } else { if (localStorage.getItem("data-bs-theme") !== null) { themeMode = localStorage.getItem("data-bs-theme"); } else { themeMode = defaultThemeMode; } } if (themeMode === "system") { themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } document.documentElement.setAttribute("data-bs-theme", themeMode); }';

const DashboardPage = ({ bodyHtml, bodyAttributes }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const body = document.body;
    const originalId = body.id;
    const originalClassName = body.className;
    const originalAttributes: Record<string, string | null> = {};

    Object.entries(bodyAttributes).forEach(([key, value]) => {
      if (key === 'id') {
        body.id = value;
        return;
      }
      if (key === 'class') {
        body.className = value;
        return;
      }
      originalAttributes[key] = body.getAttribute(key);
      body.setAttribute(key, value);
    });

    return () => {
      body.id = originalId;
      body.className = originalClassName;
      Object.entries(bodyAttributes).forEach(([key]) => {
        const previousValue = originalAttributes[key];
        if (previousValue) {
          body.setAttribute(key, previousValue);
        } else {
          body.removeAttribute(key);
        }
      });
    };
  }, [authorized, bodyAttributes]);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const getVar = (name: string, fallback: string) => rootStyles.getPropertyValue(name).trim() || fallback;

    const initChart47 = (ApexChartsLib: any) => {
      const element = document.getElementById('kt_charts_widget_47');
      if (!element) return;

      const height = parseInt(getComputedStyle(element).height || '0', 10) || 200;
      const baseColor = getVar('--bs-white', '#ffffff');
      const lightColor = getVar('--bs-white', '#ffffff');

      const options: ApexOptions = {
        series: [
          {
            name: 'Sales',
            data: [5, 5, 15, 15, 19, 16, 27, 24, 34, 25, 40, 30, 19, 17, 22, 10, 14, 14],
          },
        ],
        chart: {
          fontFamily: 'inherit',
          type: 'area',
          height,
          toolbar: { show: false },
        },
        legend: { show: false },
        dataLabels: { enabled: false },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 80, 100],
          },
        },
        stroke: {
          curve: 'smooth',
          show: true,
          width: 2,
          colors: [baseColor],
        },
        xaxis: {
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { show: false },
          crosshairs: {
            position: 'front',
            stroke: { color: baseColor, width: 1, dashArray: 3 },
          },
          tooltip: { enabled: false },
        },
        yaxis: { labels: { show: false } },
        states: {
          normal: { filter: { type: 'none', value: 0 } },
          hover: { filter: { type: 'none', value: 0 } },
          active: { allowMultipleDataPointsSelection: false, filter: { type: 'none', value: 0 } },
        },
        tooltip: { enabled: false },
        colors: [lightColor],
        grid: { yaxis: { lines: { show: false } } },
        markers: { strokeColor: baseColor, strokeWidth: 2 },
      };

      const chart = new ApexChartsLib(element, options);
      chart.render();
      return chart;
    };

    const initChart48 = (ApexChartsLib: any) => {
      const element = document.getElementById('kt_charts_widget_48');
      if (!element) return;

      const height = parseInt(getComputedStyle(element).height || '0', 10) || 200;
      const baseColor = getVar('--bs-danger', '#f1416c');
      const lightColor = baseColor;

      const options: ApexOptions = {
        series: [
          {
            name: 'Sales',
            data: [5, 5, 15, 15, 19, 16, 27, 24, 34, 25, 40, 30, 19, 17, 22, 10, 14, 14],
          },
        ],
        chart: {
          fontFamily: 'inherit',
          type: 'area',
          height,
          toolbar: { show: false },
        },
        legend: { show: false },
        dataLabels: { enabled: false },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 120, 50],
          },
        },
        stroke: {
          curve: 'smooth',
          show: true,
          width: 2,
          colors: [baseColor],
        },
        xaxis: {
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { show: false },
          crosshairs: {
            position: 'front',
            stroke: { color: baseColor, width: 1, dashArray: 3 },
          },
          tooltip: { enabled: false },
        },
        yaxis: { labels: { show: false } },
        states: {
          normal: { filter: { type: 'none', value: 0 } },
          hover: { filter: { type: 'none', value: 0 } },
          active: { allowMultipleDataPointsSelection: false, filter: { type: 'none', value: 0 } },
        },
        tooltip: { enabled: false },
        colors: [lightColor],
        grid: { yaxis: { lines: { show: false } } },
        markers: { strokeColor: baseColor, strokeWidth: 2 },
      };

      const chart = new ApexChartsLib(element, options);
      chart.render();
      return chart;
    };

    const initTableChart = (ApexChartsLib: any, selector: string, data: number[]) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return;

      const height = parseInt(getComputedStyle(element).height || '0', 10) || 50;
      const color = element.getAttribute('data-kt-chart-color') ?? 'primary';

      const strokeColor = getVar('--bs-gray-300', '#e4e6ef');
      const baseColor = getVar(`--bs-${color}`, '#009ef7');
      const lightColor = getVar('--bs-body-bg', '#ffffff');

      const options: ApexOptions = {
        series: [{ name: 'Net Profit', data }],
        chart: {
          fontFamily: 'inherit',
          type: 'area',
          height,
          toolbar: { show: false },
          zoom: { enabled: false },
          sparkline: { enabled: true },
        },
        legend: { show: false },
        dataLabels: { enabled: false },
        fill: { type: 'solid', opacity: 1 },
        stroke: {
          curve: 'smooth',
          show: true,
          width: 2,
          colors: [baseColor],
        },
        xaxis: {
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { show: false },
          crosshairs: {
            show: false,
            position: 'front',
            stroke: { color: strokeColor, width: 1, dashArray: 3 },
          },
          tooltip: { enabled: false },
        },
        yaxis: {
          min: 0,
          max: 60,
          labels: { show: false },
        },
        states: {
          normal: { filter: { type: 'none', value: 0 } },
          hover: { filter: { type: 'none', value: 0 } },
          active: { allowMultipleDataPointsSelection: false, filter: { type: 'none', value: 0 } },
        },
        tooltip: { enabled: false },
        colors: [lightColor],
        markers: {
          colors: [lightColor],
          strokeColor: [baseColor],
          strokeWidth: 3,
        },
      };

      const chart = new ApexChartsLib(element, options);
      chart.render();
      return chart;
    };

    let cancelled = false;
    const charts: any[] = [];

    (async () => {
      const { default: ApexChartsLib } = await import('apexcharts');
      if (cancelled) {
        return;
      }

      const c47 = initChart47(ApexChartsLib);
      if (c47) charts.push(c47);
      const c48 = initChart48(ApexChartsLib);
      if (c48) charts.push(c48);

      const chart1Data = [7, 10, 5, 21, 6, 11, 5, 23, 5, 11, 18, 7, 21, 13];
      const chart2Data = [17, 5, 23, 2, 21, 9, 17, 23, 4, 24, 9, 17, 21, 7];
      const chart3Data = [2, 24, 5, 17, 7, 2, 12, 24, 5, 24, 2, 8, 12, 7];
      const chart4Data = [24, 3, 5, 19, 3, 7, 25, 14, 5, 14, 2, 8, 5, 17];
      const chart5Data = [3, 23, 1, 19, 3, 17, 3, 9, 25, 4, 2, 18, 25, 3];

      [chart1Data, chart2Data, chart3Data, chart4Data, chart5Data].forEach((data, index) => {
        const c = initTableChart(ApexChartsLib, `#kt_table_widget_15_chart_${index + 1}`, data);
        if (c) charts.push(c);
      });
    })();

    return () => {
      cancelled = true;
      charts.forEach((chart) => chart.destroy());
    };
  }, [authorized]);

  const content = useMemo(() => ({ __html: bodyHtml }), [bodyHtml]);

  useDashboardInteractions(authorized);

  if (!authorized) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Metronic - The World&apos;s #1 Selling Tailwind CSS &amp; Bootstrap Admin Template by KeenThemes</title>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="The most advanced Tailwind CSS & Bootstrap 5 Admin Theme with 40 unique prebuilt layouts on Themeforest trusted by 100,000 beginners and professionals. Multi-demo, Dark Mode, RTL support and complete React, Angular, Vue, Asp.Net Core, Rails, Spring, Blazor, Django, Express.js, Node.js, Flask, Symfony & Laravel versions. Grab your copy now and get life-time updates for free."
        />
        <meta
          name="keywords"
          content="tailwind, tailwindcss, metronic, bootstrap, bootstrap 5, angular, VueJs, React, Asp.Net Core, Rails, Spring, Blazor, Django, Express.js, Node.js, Flask, Symfony & Laravel starter kits, admin themes, web design, figma, web development, free templates, free admin themes, bootstrap theme, bootstrap template, bootstrap dashboard, bootstrap dak mode, bootstrap button, bootstrap datepicker, bootstrap timepicker, fullcalendar, datatables, flaticon"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content="Metronic - The World's #1 Selling Tailwind CSS & Bootstrap Admin Template by KeenThemes"
        />
        <meta property="og:url" content="https://keenthemes.com/metronic" />
        <meta property="og:site_name" content="Metronic by Keenthemes" />
        <link rel="canonical" href="http://preview.keenthemes.com/index.html" />
        <link rel="shortcut icon" href="/assets/media/logos/favicon.ico" />
      </Head>
      <script dangerouslySetInnerHTML={{ __html: frameBustingScript }} />
      <script dangerouslySetInnerHTML={{ __html: themeModeScript }} />
      <div dangerouslySetInnerHTML={content} />
    </>
  );
};

// Sidebar hover + tabs + card toolbar menus behavior
const useDashboardInteractions = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const sidebarMenu = document.getElementById('kt_aside_menu');
    const hoverBindings: Array<{ item: HTMLElement; enter: () => void; leave: () => void }> = [];
    const hoverTimeouts = new Map<HTMLElement, number>();

    const showItem = (item: HTMLElement) => {
      const sub = item.querySelector<HTMLElement>('.menu-sub');
      if (!sub) return;

      item.classList.add('show', 'menu-dropdown', 'hover');
      sub.classList.add('show');
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

    const closeToolbarMenus = () => {
      document
        .querySelectorAll<HTMLElement>('.card-toolbar [data-kt-menu="true"]')
        .forEach((menu) => menu.classList.remove('show'));
    };

    const onDocumentClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.card-toolbar')) {
        return;
      }
      closeToolbarMenus();
    };

    document.addEventListener('click', onDocumentClick);

    const toolbarTriggers = Array.from(
      document.querySelectorAll<HTMLElement>('.card-toolbar [data-kt-menu-trigger]')
    );

    toolbarTriggers.forEach((button) => {
      const sibling = button.nextElementSibling as HTMLElement | null;
      const menu =
        sibling && sibling.matches('[data-kt-menu="true"]')
          ? sibling
          : (button.parentElement?.querySelector<HTMLElement>('[data-kt-menu="true"]') ?? null);

      if (!menu) {
        return;
      }

      const handler = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        const isShown = menu.classList.contains('show');
        closeToolbarMenus();
        if (!isShown) {
          menu.classList.add('show');
        }
      };

      button.addEventListener('click', handler);
      toolbarBindings.push({ button, handler });
    });

    return () => {
      hoverBindings.forEach(({ item, enter, leave }) => {
        item.removeEventListener('mouseenter', enter);
        item.removeEventListener('mouseleave', leave);
      });
      hoverTimeouts.forEach((id) => window.clearTimeout(id));

      tabBindings.forEach(({ link, handler }) => {
        link.removeEventListener('click', handler);
      });

      toolbarBindings.forEach(({ button, handler }) => {
        button.removeEventListener('click', handler);
      });
      document.removeEventListener('click', onDocumentClick);
    };
  }, [enabled]);
};

export const getStaticProps: GetStaticProps<DashboardTemplateProps> = async () => {
  const templateRelative = path.join('templates', 'index.html');
  const candidateRoots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '..', '..')];
  let templatePath: string | null = null;

  for (const root of candidateRoots) {
    const candidate = path.join(root, templateRelative);
    try {
      await fs.access(candidate);
      templatePath = candidate;
      break;
    } catch {
      // continue searching
    }
  }

  if (!templatePath) {
    throw new Error(`Unable to locate templates/index.html. Tried roots: ${candidateRoots.join(', ')}`);
  }

  const html = await fs.readFile(templatePath, 'utf8');
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);

  if (!bodyMatch) {
    throw new Error('Unable to find <body> in Metronic template');
  }

  const bodyAttrString = bodyMatch[1];
  let bodyContent = bodyMatch[2];

  bodyContent = bodyContent.replace(
    /<!--begin::Theme mode setup on page load-->[\s\S]*?<!--end::Theme mode setup on page load-->/i,
    ''
  );

  const scriptsMatch = bodyContent.match(/<!--begin::Javascript-->[\s\S]*<!--end::Javascript-->/i);
  if (scriptsMatch) {
    bodyContent = bodyContent.replace(scriptsMatch[0], '');
  }

  const rewriteAssets = (input: string) =>
    input
      .replace(/src="assets\//g, 'src="/assets/')
      .replace(/src='assets\//g, "src='/assets/")
      .replace(/href="assets\//g, 'href="/assets/')
      .replace(/href='assets\//g, "href='/assets/")
      .replace(/="assets\//g, '="/assets/')
      .replace(/='assets\//g, "='/assets/")
      .replace(/url\((['"]?)assets\//g, 'url($1/assets/');

  bodyContent = rewriteAssets(bodyContent);

  const attributes: Record<string, string> = {};
  const attrRegex = /([^\s=]+)="([^"]*)"/g;
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = attrRegex.exec(bodyAttrString)) !== null) {
    attributes[attrMatch[1]] = attrMatch[2];
  }

  return {
    props: {
      bodyHtml: bodyContent.trim(),
      bodyAttributes: attributes,
    },
  };
};

export default DashboardPage;
