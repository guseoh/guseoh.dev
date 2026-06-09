import { remarkAlert } from "remark-github-blockquote-alert";

const calloutTitle = Symbol("calloutTitle");
const calloutMarker = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i;

function walk(node, visitor) {
  if (!node || typeof node !== "object") return;

  visitor(node);

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => walk(child, visitor));
  }
}

function trimTitleNodes(nodes) {
  const title = [...nodes];

  while (title[0]?.type === "text") {
    title[0] = { ...title[0], value: title[0].value.trimStart() };
    if (title[0].value) break;
    title.shift();
  }

  while (title.at(-1)?.type === "text") {
    const lastIndex = title.length - 1;
    title[lastIndex] = { ...title[lastIndex], value: title[lastIndex].value.trimEnd() };
    if (title[lastIndex].value) break;
    title.pop();
  }

  return title;
}

function hasTitleText(nodes) {
  return nodes.some((node) => {
    if (node.type === "text" || node.type === "inlineCode") {
      return node.value.trim().length > 0;
    }

    return Array.isArray(node.children) && hasTitleText(node.children);
  });
}

function splitFirstLine(children, marker) {
  const titleNodes = [];
  const bodyNodes = [];
  let readingTitle = true;

  children.forEach((node, index) => {
    let current = node;

    if (index === 0) {
      current = { ...node, value: node.value.slice(marker.length) };
    }

    if (!readingTitle) {
      bodyNodes.push(current);
      return;
    }

    if (current.type === "break") {
      readingTitle = false;
      return;
    }

    if (current.type === "text") {
      const newlineIndex = current.value.search(/\r?\n/);

      if (newlineIndex !== -1) {
        const titleText = current.value.slice(0, newlineIndex);
        const bodyText = current.value.slice(newlineIndex).replace(/^\r?\n/, "");

        if (titleText) {
          titleNodes.push({ ...current, value: titleText });
        }
        if (bodyText) {
          bodyNodes.push({ ...current, value: bodyText });
        }

        readingTitle = false;
        return;
      }
    }

    titleNodes.push(current);
  });

  return {
    titleNodes: trimTitleNodes(titleNodes),
    bodyNodes
  };
}

function captureCustomTitles(tree) {
  walk(tree, (node) => {
    if (node.type !== "blockquote") return;

    const firstParagraph = node.children?.[0];
    const firstNode = firstParagraph?.type === "paragraph" ? firstParagraph.children?.[0] : undefined;

    if (firstNode?.type !== "text") return;

    const marker = firstNode.value.match(calloutMarker)?.[0];
    if (!marker) return;

    const { titleNodes, bodyNodes } = splitFirstLine(firstParagraph.children, marker);
    if (!hasTitleText(titleNodes)) return;

    node[calloutTitle] = titleNodes;
    firstParagraph.children = bodyNodes.length
      ? [{ type: "text", value: `${marker}\n` }, ...bodyNodes]
      : [{ type: "text", value: marker }];
  });
}

function restoreCustomTitles(tree) {
  walk(tree, (node) => {
    const titleNodes = node?.[calloutTitle];
    if (!titleNodes) return;

    const titleParagraph = node.children?.find(
      (child) => child.data?.hProperties?.className === "markdown-alert-title"
    );

    if (titleParagraph) {
      titleParagraph.children = [titleParagraph.children[0], ...titleNodes];
    }

    delete node[calloutTitle];
  });
}

export function remarkCallout() {
  const transformAlerts = remarkAlert();

  return (tree) => {
    captureCustomTitles(tree);
    transformAlerts(tree);
    restoreCustomTitles(tree);
  };
}
