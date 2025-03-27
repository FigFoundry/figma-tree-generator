figma.showUI(__html__, { themeColors: true, width: 300, height: 400 });

// Message handler for plugin communications
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-layers-tree') {
    const layersTree = generateLayersTree(msg.maxDepth, msg.showTypes);
    figma.ui.postMessage({
      type: 'layers-tree-result',
      tree: layersTree
    });
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// Generate tree string for layers with optional max depth and type display
function generateLayersTree(maxDepth: number = -1, showTypes: boolean = false): string {
  // Get current selection or current page if nothing is selected
  const startingNode = figma.currentPage.selection.length > 0 
    ? figma.currentPage.selection[0] 
    : figma.currentPage;
  
  return buildLayerTreeString(startingNode, 0, true, maxDepth, showTypes, []);
}

// Recursive function to build layer tree string
function buildLayerTreeString(
  node: PageNode | SceneNode,
  depth: number = 0, 
  isLast: boolean = true, 
  maxDepth: number = -1,
  showTypes: boolean = false,
  isLastByLevel: boolean[] = []
): string {
  let treeString = '';
  
  // Check if we've reached the max depth
  if (maxDepth !== -1 && depth > maxDepth) {
    return treeString;
  }
  
  // Add proper indentation based on ancestry
  for (let i = 0; i < depth; i++) {
    treeString += isLastByLevel[i] ? '    ' : '│   ';
  }
  
  // Add branch symbol (different for last item)
  if (depth > 0) {
    treeString += isLast ? '└── ' : '├── ';
  }
  
  // Add node name or placeholder if empty
  const displayName = node.name.trim() === '' ? `<${node.type.toLowerCase()}>` : node.name;
  treeString += displayName;
  
  // Add node type in parentheses if showTypes is true
  if (showTypes) {
    treeString += ` (${node.type})`;
  }
  
  treeString += '\n';
  
  // Process children if the node has them and we haven't reached max depth
  if ('children' in node && node.children && (maxDepth === -1 || depth < maxDepth)) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const isChildLast = i === children.length - 1;
      
      // Track whether this level will draw as "last" for proper indentation in children
      const nextIsLastByLevel = [...isLastByLevel];
      if (depth >= 0) {
        nextIsLastByLevel[depth] = isLast;
      }
      
      treeString += buildLayerTreeString(child, depth + 1, isChildLast, maxDepth, showTypes, nextIsLastByLevel);
    }
  }
  
  return treeString;
}