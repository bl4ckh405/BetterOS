import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

// Platform-specific API keys (using test key for both at the moment)
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || 'test_BGbuspRvKyoEdpEWXGHfFUfnAlA';
const ENTITLEMENT_ID = 'BetterOS Pro';

class RevenueCatService {
  private initialized = false;

  async initialize(userId?: string) {
    if (this.initialized) return;

    try {
      // Use platform-specific API key
      const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
      
      Purchases.configure({ apiKey });
      
      if (userId) {
        await Purchases.logIn(userId);
      }

      this.initialized = true;
      console.log(`✅ RevenueCat initialized for ${Platform.OS}`);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  async isProUser(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    } catch (error) {
      console.error('Failed to check pro status:', error);
      return false;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return null;
    }
  }

  async purchasePackage(packageId: string) {
    try {
      const offerings = await this.getOfferings();
      if (!offerings) throw new Error('No offerings available');

      const packageToPurchase = offerings.availablePackages.find(
        pkg => pkg.identifier === packageId
      );

      if (!packageToPurchase) throw new Error('Package not found');

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
        return null;
      }
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      return await Purchases.restorePurchases();
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async logOut() {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  getPlatform(): 'ios' | 'android' | 'web' {
    return Platform.OS as 'ios' | 'android' | 'web';
  }

  isIOS(): boolean {
    return Platform.OS === 'ios';
  }

  isAndroid(): boolean {
    return Platform.OS === 'android';
  }
}

export const revenueCatService = new RevenueCatService();
