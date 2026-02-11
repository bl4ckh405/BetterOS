import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { revenueCatService } from '@/services/revenuecat';
import { CustomerInfo } from 'react-native-purchases';

interface SubscriptionContextType {
  isProUser: boolean;
  customerInfo: CustomerInfo | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isProUser: false,
  customerInfo: null,
  loading: true,
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isProUser, setIsProUser] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      const isPro = await revenueCatService.isProUser();
      setIsProUser(isPro);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        await revenueCatService.initialize();
        await refreshSubscription();
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
        setLoading(false);
      }
    };

    initializeRevenueCat();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isProUser, customerInfo, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
