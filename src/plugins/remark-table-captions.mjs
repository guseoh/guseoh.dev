const captionPattern = /^<!--\s*table-caption:\s*([\s\S]*?)\s*-->$/i;

function normalizeCaption(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function remarkTableCaptions() {
  return (tree) => {
    if (!Array.isArray(tree?.children)) return;

    for (let index = 0; index < tree.children.length - 1; index += 1) {
      const marker = tree.children[index];
      const table = tree.children[index + 1];

      if (marker?.type !== "html" || table?.type !== "table") continue;

      const match = String(marker.value ?? "").match(captionPattern);
      if (!match) continue;

      const caption = normalizeCaption(match[1]);
      if (!caption) continue;

      table.data = {
        ...table.data,
        hProperties: {
          ...(table.data?.hProperties ?? {}),
          dataTableCaption: caption
        }
      };

      tree.children.splice(index, 1);
      index -= 1;
    }
  };
}
