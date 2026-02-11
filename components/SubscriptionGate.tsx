import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Paywall from './Paywall';

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onGateTriggered?: () => void;
}

export default function SubscriptionGate({ 
  children, 
  fallback,
  onGateTriggered 
}: SubscriptionGateProps) {
  const { isProUser, loading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  if (loading) {
    return null;
  }

  if (!isProUser) {
    return (
      <>
        {fallback || null}
        <Paywall 
          visible={showPaywall} 
          onClose={() => setShowPaywall(false)} 
        />
      </>
    );
  }

  return <>{children}</>;
}

export function useSubscriptionGate() {
  const { isProUser } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const checkAccess = () => {
    if (!isProUser) {
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  const PaywallComponent = ({ visible, onClose }: { visible?: boolean; onClose?: () => void }) => (
    <Paywall 
      visible={visible !== undefined ? visible : showPaywall} 
      onClose={onClose || (() => setShowPaywall(false))} 
    />
  );

  return {
    isProUser,
    checkAccess,
    PaywallComponent,
  };
}
