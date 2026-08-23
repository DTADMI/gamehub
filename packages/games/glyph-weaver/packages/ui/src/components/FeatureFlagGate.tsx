'use client'

import { getFeatureFlag, type FeatureFlag } from '../../../core/src'
import React from 'react'

interface FeatureFlagGateProps {
  flag: FeatureFlag
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureFlagGate({ flag, children, fallback = null }: FeatureFlagGateProps) {
  const enabled = getFeatureFlag(flag)

  if (!enabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
