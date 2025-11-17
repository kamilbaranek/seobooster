import { RefObject, useEffect } from "react";
import type { ApexOptions } from "apexcharts";

const chartData = {
  widget47: [
    5, 5, 15, 15, 19, 16, 27, 24, 34, 25, 40, 30, 19, 17, 22, 10, 14, 14,
  ],
  widget48: [
    5, 5, 15, 15, 19, 16, 27, 24, 34, 25, 40, 30, 19, 17, 22, 10, 14, 14,
  ],
  table: [
    [7, 10, 5, 21, 6, 11, 5, 23, 5, 11, 18, 7, 21, 13],
    [17, 5, 23, 2, 21, 9, 17, 23, 4, 24, 9, 17, 21, 7],
    [2, 24, 5, 17, 7, 2, 12, 24, 5, 24, 2, 8, 12, 7],
    [24, 3, 5, 19, 3, 7, 25, 14, 5, 14, 2, 8, 5, 17],
    [3, 23, 1, 19, 3, 17, 3, 9, 25, 4, 2, 18, 25, 3],
  ],
};

const useCharts = (contentRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const root = contentRef.current;
    if (!root) {
      return;
    }

    let cancelled = false;
    const charts: Array<{ destroy: () => void }> = [];
    const rootStyles = getComputedStyle(document.documentElement);
    const getVar = (name: string, fallback: string) =>
      rootStyles.getPropertyValue(name).trim() || fallback;

    const initChart = async () => {
      const { default: ApexChartsLib } = await import("apexcharts");
      if (cancelled) {
        return;
      }

      const chart47Element = root.querySelector<HTMLElement>(
        "#kt_charts_widget_47",
      );
      if (chart47Element) {
        const chart = new ApexChartsLib(
          chart47Element,
          buildWidget47Options(chart47Element, getVar),
        );
        chart.render();
        charts.push(chart);
      }

      const chart48Element = root.querySelector<HTMLElement>(
        "#kt_charts_widget_48",
      );
      if (chart48Element) {
        const chart = new ApexChartsLib(
          chart48Element,
          buildWidget48Options(chart48Element, getVar),
        );
        chart.render();
        charts.push(chart);
      }

      chartData.table.forEach((series, index) => {
        const selector = `#kt_table_widget_15_chart_${index + 1}`;
        const element = root.querySelector<HTMLElement>(selector);
        if (!element) {
          return;
        }
        const chart = new ApexChartsLib(
          element,
          buildTableOptions(element, series, getVar),
        );
        chart.render();
        charts.push(chart);
      });
    };

    initChart();

    return () => {
      cancelled = true;
      charts.forEach((chart) => chart.destroy());
    };
  }, [contentRef]);
};

const buildWidget47Options = (
  element: HTMLElement,
  getVar: (name: string, fallback: string) => string,
): ApexOptions => {
  const height = parseInt(getComputedStyle(element).height || "0", 10) || 200;
  const baseColor = getVar("--bs-white", "#ffffff");
  const lightColor = getVar("--bs-white", "#ffffff");

  return {
    series: [{ name: "Sales", data: chartData.widget47 }],
    chart: {
      fontFamily: "inherit",
      type: "area",
      height,
      toolbar: { show: false },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 80, 100],
      },
    },
    stroke: { curve: "smooth", show: true, width: 2, colors: [baseColor] },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { show: false },
      crosshairs: {
        position: "front",
        stroke: { color: baseColor, width: 1, dashArray: 3 },
      },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { show: false } },
    states: {
      normal: { filter: { type: "none", value: 0 } },
      hover: { filter: { type: "none", value: 0 } },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "none", value: 0 },
      },
    },
    tooltip: { enabled: false },
    colors: [lightColor],
    grid: { yaxis: { lines: { show: false } } },
    markers: { strokeColors: baseColor, strokeWidth: 2 },
  };
};

const buildWidget48Options = (
  element: HTMLElement,
  getVar: (name: string, fallback: string) => string,
): ApexOptions => {
  const height = parseInt(getComputedStyle(element).height || "0", 10) || 200;
  const baseColor = getVar("--bs-danger", "#f1416c");

  return {
    series: [{ name: "Sales", data: chartData.widget48 }],
    chart: {
      fontFamily: "inherit",
      type: "area",
      height,
      toolbar: { show: false },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 120, 50],
      },
    },
    stroke: { curve: "smooth", show: true, width: 2, colors: [baseColor] },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { show: false },
      crosshairs: {
        position: "front",
        stroke: { color: baseColor, width: 1, dashArray: 3 },
      },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { show: false } },
    states: {
      normal: { filter: { type: "none", value: 0 } },
      hover: { filter: { type: "none", value: 0 } },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "none", value: 0 },
      },
    },
    tooltip: { enabled: false },
    colors: [baseColor],
    grid: { yaxis: { lines: { show: false } } },
    markers: { strokeColors: baseColor, strokeWidth: 2 },
  };
};

const buildTableOptions = (
  element: HTMLElement,
  data: number[],
  getVar: (name: string, fallback: string) => string,
): ApexOptions => {
  const height = parseInt(getComputedStyle(element).height || "0", 10) || 50;
  const color = element.getAttribute("data-kt-chart-color") ?? "primary";

  const strokeColor = getVar("--bs-gray-300", "#e4e6ef");
  const baseColor = getVar(`--bs-${color}`, "#009ef7");
  const lightColor = getVar("--bs-body-bg", "#ffffff");

  return {
    series: [{ name: "Net Profit", data }],
    chart: {
      fontFamily: "inherit",
      type: "area",
      height,
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: true },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: { type: "solid", opacity: 1 },
    stroke: { curve: "smooth", show: true, width: 2, colors: [baseColor] },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { show: false },
      crosshairs: {
        show: false,
        position: "front",
        stroke: { color: strokeColor, width: 1, dashArray: 3 },
      },
      tooltip: { enabled: false },
    },
    yaxis: { min: 0, max: 60, labels: { show: false } },
    states: {
      normal: { filter: { type: "none", value: 0 } },
      hover: { filter: { type: "none", value: 0 } },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "none", value: 0 },
      },
    },
    tooltip: { enabled: false },
    colors: [lightColor],
    markers: { colors: [lightColor], strokeColors: [baseColor], strokeWidth: 3 },
  };
};

export default useCharts;
