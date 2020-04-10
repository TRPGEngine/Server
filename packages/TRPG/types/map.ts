export type MapUpdateType = 'add' | 'update' | 'remove';

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface TokenAttrs {
  _id: string;
  gridPosition: Position;
  gridAreaSize: Size;
}

export interface UpdateTokenPayloadMap {
  add: {
    layerId: string;
    token: TokenAttrs;
  };
  update: {
    layerId: string;
    tokenId: string;
    tokenAttrs: Partial<TokenAttrs>;
  };
  remove: {
    layerId: string;
    tokenId: string;
  };
}

type MapDataToken = TokenAttrs;
export interface MapDataLayer {
  _id: string;
  name: string;
  tokens: MapDataToken[];
}
export interface MapData {
  layers: MapDataLayer[];
}
