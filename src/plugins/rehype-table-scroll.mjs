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

function wrapTables(node) {
  if (!Array.isArray(node?.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (isElement(child, "table")) {
      addColumnScopes(child);
      node.children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["table-scroll"]
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
