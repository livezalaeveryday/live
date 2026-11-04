import { FLAVOR_CONFIGS, DEFAULT_FLAVOR } from '../src/config/flavor';
import { CREDIT_PACKAGES, createPromptPayOrder } from '../src/config/packages';

describe('Build Flavor & PromptPay Payment Model', () => {
  describe('Build Flavors Configuration', () => {
    test('DEFAULT_FLAVOR should default to direct for APK distribution', () => {
      expect(DEFAULT_FLAVOR).toBe('direct');
    });

    test('direct flavor allows in-app PromptPay purchase and bypasses Play restrictions', () => {
      const direct = FLAVOR_CONFIGS.direct;
      expect(direct.flavor).toBe('direct');
      expect(direct.allowsInAppPurchase).toBe(true);
      expect(direct.showsInformationalSteeringButton).toBe(false);
      expect(direct.purchaseModel).toBe('in_app_promptpay');
      expect(direct.distributionTarget).toBe('direct_apk');
      expect(direct.channel).toBe('livezala.com/mobileapp');
    });

    test('play flavor complies with Google Play Anti-Steering rules (zero in-app purchase)', () => {
      const play = FLAVOR_CONFIGS.play;
      expect(play.flavor).toBe('play');
      expect(play.allowsInAppPurchase).toBe(false);
      expect(play.showsInformationalSteeringButton).toBe(true);
      expect(play.purchaseModel).toBe('web_informational_only');
      expect(play.distributionTarget).toBe('google_play_or_app_store');
    });
  });

  describe('PromptPay Packages & Orders', () => {
    test('CREDIT_PACKAGES should contain valid packages with positive credits and prices', () => {
      expect(CREDIT_PACKAGES.length).toBeGreaterThanOrEqual(4);
      CREDIT_PACKAGES.forEach((pkg) => {
        expect(pkg.id).toBeTruthy();
        expect(pkg.name).toBeTruthy();
        expect(pkg.credits).toBeGreaterThan(0);
        expect(pkg.priceThb).toBeGreaterThan(0);
      });
    });

    test('createPromptPayOrder generates valid order details and references', () => {
      const pkg = CREDIT_PACKAGES[0];
      const order = createPromptPayOrder(pkg);

      expect(order.orderId).toContain('LZ-PP-');
      expect(order.packageId).toBe(pkg.id);
      expect(order.packageName).toBe(pkg.name);
      expect(order.amountThb).toBe(pkg.priceThb);
      expect(order.credits).toBe(pkg.credits);
      expect(order.ref1).toBeTruthy();
      expect(order.ref2).toBeTruthy();
      expect(order.expiresInSeconds).toBe(900);
      expect(order.status).toBe('pending');
    });
  });
});
