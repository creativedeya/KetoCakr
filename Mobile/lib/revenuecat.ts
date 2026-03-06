// ===========================================================
// FILE: mobile/lib/revenuecat.ts
// ===========================================================
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!,
})!;

export async function initializeRevenueCat(userId: string) {
  try {
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });

    // Check current entitlements
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;

    return isPremium;
  } catch (error) {
    console.error('RevenueCat initialization error:', error);
    return false;
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}