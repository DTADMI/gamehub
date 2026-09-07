'use client';

import React from 'react';

import { type FeatureFlag,getFeatureFlag } from '../../../core/src';

interface FeatureFlagGateProps {
  flag: FeatureFlag
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureFlagGate({ flag, children, fallback = null }: FeatureFlagGateProps) {
  const enabled = getFeatureFlag(flag);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
