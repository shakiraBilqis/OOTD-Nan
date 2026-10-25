// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL TRY-ON SERVICE
// Provider abstraction layer — swap providers without changing app logic
// ─────────────────────────────────────────────────────────────────────────────

import { config } from '../../config';

export interface TryOnInput {
  referenceImagePath: string;
  garmentImagePaths: string[];
  outfitName: string;
}

export interface TryOnResult {
  resultImagePath: string;
  metadata?: Record<string, unknown>;
}

export interface TryOnProvider {
  name: string;
  isAvailable(): boolean;
  process(input: TryOnInput): Promise<TryOnResult>;
}

// ─── No-Op Provider (when not configured) ─────────────────────────────────

class UnconfiguredProvider implements TryOnProvider {
  name = 'unconfigured';

  isAvailable(): boolean {
    return false;
  }

  async process(_input: TryOnInput): Promise<TryOnResult> {
    throw new Error(
      'Virtual try-on is not configured. Set VTON_PROVIDER and VTON_API_KEY in your .env file.'
    );
  }
}

// ─── FASHN Provider Stub ───────────────────────────────────────────────────

class FashnProvider implements TryOnProvider {
  name = 'fashn';

  isAvailable(): boolean {
    return config.vton.provider === 'fashn' && !!config.vton.apiKey;
  }

  async process(_input: TryOnInput): Promise<TryOnResult> {
    // TODO: Implement FASHN API integration
    // See: https://fashn.ai/docs
    // Requires: VTON_API_KEY, garment image, reference photo
    throw new Error('FASHN provider integration is not yet implemented');
  }
}

// ─── Replicate Provider Stub ───────────────────────────────────────────────

class ReplicateProvider implements TryOnProvider {
  name = 'replicate';

  isAvailable(): boolean {
    return config.vton.provider === 'replicate' && !!config.vton.apiKey;
  }

  async process(_input: TryOnInput): Promise<TryOnResult> {
    // TODO: Implement Replicate API integration
    // See: https://replicate.com/docs
    // Model: Verify license and usage rights before enabling
    throw new Error('Replicate provider integration is not yet implemented');
  }
}

// ─── Provider Registry ────────────────────────────────────────────────────

function getProvider(): TryOnProvider {
  const providers: TryOnProvider[] = [
    new FashnProvider(),
    new ReplicateProvider(),
  ];

  const configured = providers.find((p) => p.isAvailable());
  return configured ?? new UnconfiguredProvider();
}

export async function processTryOn(input: TryOnInput): Promise<TryOnResult> {
  const provider = getProvider();
  if (!provider.isAvailable()) {
    throw new Error('VTON_NOT_CONFIGURED');
  }
  return provider.process(input);
}

export function getVtonStatus(): {
  configured: boolean;
  provider: string;
  message: string;
} {
  const provider = getProvider();
  return {
    configured: provider.isAvailable(),
    provider: config.vton.provider || 'none',
    message: provider.isAvailable()
      ? `Virtual try-on ready with ${provider.name}`
      : 'Virtual try-on is not configured. Set VTON_PROVIDER and VTON_API_KEY to enable.',
  };
}
