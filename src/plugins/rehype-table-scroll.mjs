function isElement(node, tagName) {
  return node?.type === "element" && node.tagName === tagName;
}

function addColumnScopes(table) {
  const thead = table.children?.find((child) => isElement(child, "thead"));
  if (!thead) return;

  for (const row of thead.children ?? []) {
    if (!isElement(row, "tr")) continue;

    for (const cell of row.children ?? []) {
      if (!isElement(cell, "th")) continue;

      cell.properties = {
        ...cell.properties,
        scope: cell.properties?.scope ?? "col"
      };
    }
  }
}

function addCaption(table) {
  const caption = table.properties?.dataTableCaption;
  if (typeof caption !== "string" || caption.trim().length === 0) return;

  const existingCaption = table.children?.find((child) => isElement(child, "caption"));
  if (existingCaption) return;

  table.children = [
    {
      type: "element",
      tagName: "caption",
      properties: {},
      children: [{ type: "text", value: caption.trim() }]
    },
    ...(table.children ?? [])
  ];

  delete table.properties.dataTableCaption;
}

function wrapTables(node) {
  if (!Array.isArray(node?.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (isElement(child, "table")) {
      addColumnScopes(child);
      addCaption(child);
      node.children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["table-scroll"],
          dataTableCaption: child.children?.find((tableChild) => isElement(tableChild, "caption"))?.children?.[0]?.value
        },
        children: [child]
      };
      continue;
    }

    wrapTables(child);
  }
}

export function rehypeTableScroll() {
  return (tree) => {
    wrapTables(tree);
  };
}
