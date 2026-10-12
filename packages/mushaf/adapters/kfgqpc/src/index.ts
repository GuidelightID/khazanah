import {
  createHostedAdapter,
  type HostedAdapterOptions,
} from '@guidelightid/mushaf-adapter-custom';
import type { MushafAdapter } from '@guidelightid/mushaf-core';

export type HostedMadinahAdapterOptions = Omit<
  HostedAdapterOptions,
  'id' | 'displayName' | 'licenses'
> & {
  /** Override pack identity label */
  packName?: string;
};

/**
 * Hosted Madinah path (design: createHostedMadinahAdapter).
 * Loads IR/fonts metadata from app-hosted dual-distribution pack.
 */
export function createHostedMadinahAdapter(
  options: HostedMadinahAdapterOptions,
): MushafAdapter {
  const { packName = 'Madinah (hosted pack)', ...rest } = options;
  return createHostedAdapter({
    ...rest,
    id: 'kfgqpc-hosted',
    displayName: packName,
    licenses: [
      {
        spdx: 'LicenseRef-Hosted-Mushaf-Pack',
        name: 'Hosted mushaf pack (see baseUrl/NOTICE)',
        allowsNpmRedistribution: false,
        allowsModification: false,
        notes:
          'Adapter code is MIT. Page IR/fonts follow the pulled pack license (often vendor-restricted). Fixture packs may be MIT.',
      },
    ],
  });
}

export type { HostedAdapterOptions } from '@guidelightid/mushaf-adapter-custom';
