export interface FlatCategory {
  ebay_category_id: string;
  name: string;
  category_path: string;
  parent_ebay_category_id: string | null;
  level: number;
  is_leaf: boolean;
}

function flattenTree(
  node: Record<string, unknown>,
  ancestorPath: string,
  parentId: string | null,
  depth: number,
  out: FlatCategory[]
) {
  const cat = node.category as Record<string, unknown>;
  const name = cat.categoryName as string;
  const id = String(cat.categoryId);
  const children = node.childCategoryTreeNodes as Record<string, unknown>[] | undefined;
  const path = ancestorPath ? `${ancestorPath} > ${name}` : name;
  const isLeaf = !children || children.length === 0;

  // Skip depth 0 — that is the invisible root node eBay adds
  if (depth > 0) {
    out.push({
      ebay_category_id: id,
      name,
      category_path: path,
      parent_ebay_category_id: parentId,
      level: depth,
      is_leaf: isLeaf,
    });
  }

  children?.forEach(child =>
    flattenTree(child, depth > 0 ? path : "", depth > 0 ? id : null, depth + 1, out)
  );
}

export async function fetchAndFlattenCategoryTree(appToken: string): Promise<FlatCategory[]> {
  const res = await fetch("https://api.ebay.com/commerce/taxonomy/v1/category_tree/0", {
    headers: {
      Authorization: `Bearer ${appToken}`,
      "Content-Type": "application/json",
    },
    // The full tree is ~10 MB; give it enough time
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay taxonomy error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const flat: FlatCategory[] = [];
  flattenTree(data.rootCategoryNode as Record<string, unknown>, "", null, 0, flat);
  return flat;
}
