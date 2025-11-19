/**
 * Signature Pad Manager
 * Wrapper around SignaturePad library for digital signatures
 */

class SignatureManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.signaturePad = null;
    this.init();
  }

  init() {
    if (!this.canvas) {
      console.error('[SignaturePad] Canvas element not provided');
      return;
    }

    // Initialize SignaturePad from the library
    if (typeof SignaturePad !== 'undefined') {
      this.signaturePad = new SignaturePad(this.canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 0.5,
        maxWidth: 2.5
      });

      // Make canvas responsive
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    } else {
      console.error('[SignaturePad] SignaturePad library not loaded');
    }
  }

  resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * ratio;
    this.canvas.height = rect.height * ratio;
    this.canvas.getContext('2d').scale(ratio, ratio);

    this.clear(); // Clear after resize
  }

  clear() {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  isEmpty() {
    return this.signaturePad ? this.signaturePad.isEmpty() : true;
  }

  getDataURL(type = 'image/png') {
    if (this.signaturePad && !this.signaturePad.isEmpty()) {
      return this.signaturePad.toDataURL(type);
    }
    return null;
  }

  fromDataURL(dataURL) {
    if (this.signaturePad) {
      this.signaturePad.fromDataURL(dataURL);
    }
  }

  on(event, handler) {
    if (this.signaturePad) {
      this.signaturePad.addEventListener(event, handler);
    }
  }

  off(event, handler) {
    if (this.signaturePad) {
      this.signaturePad.removeEventListener(event, handler);
    }
  }
}

// Export for use in other modules
window.SignatureManager = SignatureManager;
