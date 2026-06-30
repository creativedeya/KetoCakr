import { create } from 'zustand';
import Purchases, { CustomerInfo } from 'react-native-purchases';

interface SubscriptionState {
  hasActiveSubscription: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  initialize: (apiKey: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
  presentPaywall: () => Promise<boolean>;
}

const ENTITLEMENT_ID = 'premium'; // must match RevenueCat dashboard entitlement identifier

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  hasActiveSubscription: false,
  isLoading: true,
  customerInfo: null,

  initialize: async (apiKey: string) => {
    try {
      Purchases.configure({ apiKey });
      Purchases.addCustomerInfoUpdateListener((info) => {
        set({
          customerInfo: info,
          hasActiveSubscription: typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined',
        });
      });
      const info = await Purchases.getCustomerInfo();
      set({
        customerInfo: info,
        hasActiveSubscription: typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined',
        isLoading: false,
      });
    } catch (error) {
      console.error('[RevenueCat] Init error:', error);
      set({ isLoading: false });
    }
  },

  refreshStatus: async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      set({
        customerInfo: info,
        hasActiveSubscription: typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined',
      });
    } catch (error) {
      console.error('[RevenueCat] Refresh error:', error);
    }
  },

  presentPaywall: async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current || current.availablePackages.length === 0) {
        console.warn('[RevenueCat] No offerings available');
        return false;
      }
      const purchaseResult = await Purchases.purchasePackage(current.availablePackages[0]);
      const hasEntitlement = typeof purchaseResult.customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      set({
        customerInfo: purchaseResult.customerInfo,
        hasActiveSubscription: hasEntitlement,
      });
      return hasEntitlement;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('[RevenueCat] Purchase error:', error);
      }
      return false;
    }
  },
}));
