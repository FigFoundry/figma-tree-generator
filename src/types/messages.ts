export interface GenerateLayersTreeMessage {
  type: 'generate-layers-tree';
  maxDepth: number;
  showTypes: boolean;
}

export interface CancelMessage {
  type: 'cancel';
}

export interface LayersTreeResultMessage {
  type: 'layers-tree-result';
  tree: string;
}

export type UIMessage = GenerateLayersTreeMessage | CancelMessage;
export type PluginMessage = LayersTreeResultMessage;