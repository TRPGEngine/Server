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
  gridPosition: Position;
  gridAreaSize: Size;
}

export interface UpdateTokenPayloadMap {
  add: {
    layerId: string;
    token: TokenAttrs;
  };
  update: {
    tokenId: string;
    tokenAttrs: Partial<TokenAttrs>;
  };
  remove: {
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
