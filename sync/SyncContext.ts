import { createContext, useContext } from 'react';
import type { NodeOriginMapType } from './nodeOriginMap';
import type { XmlMetaCache } from './serializeLexicalToXml';

export interface SyncContextValue {
  nodeOriginMap: NodeOriginMapType;
  xmlMetaCache: XmlMetaCache;
}

export const SyncContext = createContext<SyncContextValue | null>(null);

export const useSyncContext = (): SyncContextValue => {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSyncContext must be used within a SyncContext.Provider');
  }
  return ctx;
};
