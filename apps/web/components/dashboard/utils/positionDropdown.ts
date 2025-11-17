export const parseOffset = (raw?: string | null): { x: number; y: number } => {
  if (!raw) return { x: 0, y: 0 };
  const parts = raw.split(",").map((part) => part.trim());
  const [xStr, yStr] = [parts[0] ?? "0", parts[1] ?? "0"];
  const parse = (value: string) => {
    const num = parseFloat(value.replace("px", ""));
    return Number.isFinite(num) ? num : 0;
  };
  return { x: parse(xStr), y: parse(yStr) };
};

export const positionDropdown = (
  trigger: HTMLElement,
  menu: HTMLElement,
  placementRaw?: string | null,
  offsetRaw?: string | null,
) => {
  const rect = trigger.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const { innerWidth, innerHeight } = window;
  const { x: offsetX, y: offsetY } = parseOffset(offsetRaw);

  const placement = placementRaw ?? "bottom-end";
  const [primary, secondary] = placement.split("-") as [
    string,
    string | undefined,
  ];

  let top = rect.bottom;
  let left = rect.left;

  const width = menuRect.width || menu.offsetWidth;
  const height = menuRect.height || menu.offsetHeight;

  if (primary === "top") {
    top = rect.top - height;
  } else if (primary === "bottom") {
    top = rect.bottom;
  } else if (primary === "left" || primary === "right") {
    top = rect.top;
  }

  if (primary === "left") {
    left = rect.left - width;
  } else if (primary === "right") {
    left = rect.right;
  } else if (secondary === "end") {
    left = rect.right - width;
  } else {
    left = rect.left;
  }

  top += offsetY;
  left += offsetX;

  const padding = 8;
  top = Math.min(Math.max(padding, top), innerHeight - height - padding);
  left = Math.min(Math.max(padding, left), innerWidth - width - padding);

  menu.style.position = "fixed";
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
};
