/** Small, deterministic purchase state machine shared by the WebGL preview and its accessible fallback. */
export class VendingPreview {
  constructor(productCount = 12) {
    this.productIds = Array.from({ length: productCount }, (_, index) => index);
    this.reset();
  }

  reset() {
    this.availableProducts = new Set(this.productIds);
    this.selectedProductId = null;
    this.state = 'idle';
  }

  select(productId = [...this.availableProducts][0]) {
    if (this.state === 'selected' || this.state === 'paid') {
      return { accepted: false, action: 'blocked', state: this.state, message: 'Finish the current purchase first.' };
    }
    if (productId == null || !this.availableProducts.has(productId)) {
      return { accepted: false, action: 'empty', state: this.state, message: 'That product is out of stock.' };
    }
    this.selectedProductId = productId;
    this.state = 'selected';
    return { accepted: true, action: 'selected', state: this.state, productId, message: 'Product selected. Continue to simulate payment.' };
  }

  advance() {
    if (this.state === 'selected') {
      this.state = 'paid';
      return { accepted: true, action: 'paid', state: this.state, productId: this.selectedProductId, message: 'Simulated payment accepted. Continue to dispense.' };
    }
    if (this.state === 'paid') {
      const productId = this.selectedProductId;
      this.availableProducts.delete(productId);
      this.selectedProductId = null;
      this.state = 'dispensed';
      return { accepted: true, action: 'dispensed', state: this.state, productId, remaining: this.availableProducts.size, message: 'Product dispensed.' };
    }
    return { accepted: false, action: 'blocked', state: this.state, message: 'Choose an available product before continuing.' };
  }
}
