TASK: Install RevenueCat SDK and create subscription store
Step 1 — Install package:
bashnpx expo install react-native-purchases
Step 2 — Create Mobile/store/useSubscriptionStore.ts:
tsimport { create } from 'zustand';
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
Step 3 — Before editing Mobile/app/_layout.tsx, first show me its current full content (use view tool) so we confirm the correct insertion point for the useEffect initialization. Do NOT edit it yet — just report back what the file looks like.
Step 4 — Add to Mobile/.env (create the line if .env exists, or report if it doesn't exist so we handle it separately):
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
(leave value empty as placeholder — will be filled once RevenueCat dashboard setup is complete)
Use create_file for the store. Use bash_tool for the install command. Report _layout.tsx content before any edits to it.