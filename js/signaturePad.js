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
      // Detect if mobile/touch device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      this.signaturePad = new SignaturePad(this.canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        // Optimize pen width for mobile
        minWidth: isMobile || isTouch ? 1 : 0.5,
        maxWidth: isMobile || isTouch ? 3 : 2.5,
        // Smoother lines on mobile
        velocityFilterWeight: isMobile || isTouch ? 0.5 : 0.7,
        // Minimum distance between points (higher = smoother but less precise)
        minDistance: isMobile || isTouch ? 3 : 5,
        // Smoother curves
        throttle: 0
      });

      // Make canvas responsive
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      // Prevent scrolling while signing on mobile
      if (isTouch) {
        this.preventScrolling();
      }

      // iOS-specific optimizations
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        this.canvas.style.touchAction = 'none';
        this.canvas.style.msTouchAction = 'none';
      }
    } else {
      console.error('[SignaturePad] SignaturePad library not loaded');
    }
  }

  /**
   * Prevent page scrolling while signing on mobile
   */
  preventScrolling() {
    // Prevent default touch behavior to stop scrolling
    this.canvas.addEventListener('touchstart', (e) => {
      // Only prevent if actually drawing
      if (e.target === this.canvas) {
        e.preventDefault();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = this.canvas.getBoundingClientRect();

    // Save current signature data before resize
    const data = this.signaturePad && !this.signaturePad.isEmpty()
      ? this.signaturePad.toData()
      : null;

    this.canvas.width = rect.width * ratio;
    this.canvas.height = rect.height * ratio;

    const ctx = this.canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    // Restore signature after resize
    if (data && this.signaturePad) {
      this.signaturePad.fromData(data);
    } else {
      this.clear();
    }
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
