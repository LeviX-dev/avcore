
export const buildTree = (menus: any[]) => {
  const map: Record<string, any> = {};
  const tree: any[] = [];

  // Create nodes
  menus.forEach(m => {
    map[m.menu_key] = { ...m, children: [] };
  });

  // Build tree
  menus.forEach(m => {
    if (m.parent_key) {
      if (map[m.parent_key]) {
        map[m.parent_key].children.push(map[m.menu_key]);
      }
      // ❌ DO NOT push child to root
    } else {
      tree.push(map[m.menu_key]);
    }
  });

  // Sort parents & children
  tree.sort((a, b) => a.sort_order - b.sort_order);
  tree.forEach(p => {
    p.children.sort((a, b) => a.sort_order - b.sort_order);
  });

  return tree;
};
