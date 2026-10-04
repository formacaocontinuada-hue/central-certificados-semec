(() => {
  'use strict';

  const CHANNEL = 'CENTRAL_CERTIFICADOS_SEMEC';
  const BRIDGE_URL = 'https://script.google.com/a/macros/edu.tangaradaserra.mt.gov.br/s/AKfycbwBzokI4suZwZmEOJilCJ2N6y7PfWEH26hlJaYdfqCYb6m6VO7JK_-ktGwMlO2MYus/exec';
  const HANDSHAKE_PARAM = 'central_nonce';
  const READY_TIMEOUT_MS = 10000;
  const REQUEST_TIMEOUT_MS = 20000;

  const createRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const createHandshakeNonce = () => {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  const isTrustedBridgeOrigin = (origin) => {
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' && (
        url.hostname === 'script.google.com' ||
        url.hostname.endsWith('.googleusercontent.com')
      );
    } catch (_) {
      return false;
    }
  };

  class BridgeError extends Error {
    constructor(message, code = 'BRIDGE_ERROR') {
      super(message);
      this.name = 'BridgeError';
      this.code = code;
    }
  }

  class BridgeClient {
    constructor({ url = BRIDGE_URL, readyTimeout = READY_TIMEOUT_MS, requestTimeout = REQUEST_TIMEOUT_MS } = {}) {
      this.url = url;
      this.readyTimeout = readyTimeout;
      this.requestTimeout = requestTimeout;
      this.iframe = null;
      this.port = null;
      this.version = '';
      this.handshakeNonce = '';
      this.pending = new Map();
      this.connectionPromise = null;
      this.handleWindowMessage = this.handleWindowMessage.bind(this);
    }

    connect() {
      if (this.port) return Promise.resolve({ version: this.version });
      if (this.connectionPromise) return this.connectionPromise;

      this.connectionPromise = new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          window.removeEventListener('message', this.handleWindowMessage);
          this.connectionPromise = null;
          reject(new BridgeError('O backend não concluiu a conexão com a Central.', 'BRIDGE_TIMEOUT'));
        }, this.readyTimeout);

        this.resolveConnection = (value) => {
          window.clearTimeout(timeoutId);
          window.removeEventListener('message', this.handleWindowMessage);
          resolve(value);
        };

        this.rejectConnection = (error) => {
          window.clearTimeout(timeoutId);
          window.removeEventListener('message', this.handleWindowMessage);
          this.connectionPromise = null;
          reject(error);
        };

        window.addEventListener('message', this.handleWindowMessage);
        this.mountIframe();
      });

      return this.connectionPromise;
    }

    mountIframe() {
      this.iframe?.remove();

      const iframe = document.createElement('iframe');
      const bridgeUrl = new URL(this.url, window.location.href);
      this.handshakeNonce = createHandshakeNonce();
      bridgeUrl.searchParams.set(HANDSHAKE_PARAM, this.handshakeNonce);
      iframe.src = bridgeUrl.href;
      iframe.title = 'Ponte técnica da Central de Certificados';
      iframe.dataset.centralBridge = '';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.tabIndex = -1;
      iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:0;opacity:0;pointer-events:none;';
      this.iframe = iframe;
      document.body.appendChild(iframe);
    }

    handleWindowMessage(event) {
      const message = event.data || {};
      if (message.canal !== CHANNEL || message.tipo !== 'BRIDGE_READY') return;
      if (!isTrustedBridgeOrigin(event.origin)) return;
      if (!this.handshakeNonce || String(message.nonce || '') !== this.handshakeNonce) return;

      const port = event.ports && event.ports[0];
      if (!port) {
        this.rejectConnection?.(new BridgeError(
          'O backend respondeu sem entregar o canal de comunicação.',
          'BRIDGE_PORT_MISSING'
        ));
        return;
      }

      this.port = port;
      this.version = String(message.versaoBridge || '');
      this.port.start?.();
      this.port.onmessage = (portEvent) => this.handlePortMessage(portEvent.data || {});
      this.port.onmessageerror = () => this.failPending(
        new BridgeError('A resposta do backend não pôde ser lida.', 'BRIDGE_MESSAGE_ERROR')
      );
      this.resolveConnection?.({ version: this.version });
    }

    handlePortMessage(message) {
      if (message.canal !== CHANNEL || !message.requestId) return;

      const pendingRequest = this.pending.get(message.requestId);
      if (!pendingRequest) return;

      window.clearTimeout(pendingRequest.timeoutId);
      this.pending.delete(message.requestId);
      pendingRequest.resolve(message);
    }

    failPending(error) {
      this.pending.forEach(({ reject, timeoutId }) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
      this.pending.clear();
    }

    async request(action, data = {}) {
      await this.connect();
      if (!this.port) {
        throw new BridgeError('A ponte com o backend não está disponível.', 'BRIDGE_NOT_READY');
      }

      const requestId = createRequestId();

      return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          this.pending.delete(requestId);
          reject(new BridgeError('O backend demorou para responder. Tente novamente.', 'REQUEST_TIMEOUT'));
        }, this.requestTimeout);

        this.pending.set(requestId, { resolve, reject, timeoutId });

        try {
          this.port.postMessage({
            canal: CHANNEL,
            requestId,
            acao: action,
            dados: data
          });
        } catch (_) {
          window.clearTimeout(timeoutId);
          this.pending.delete(requestId);
          reject(new BridgeError('Não foi possível enviar a solicitação ao backend.', 'REQUEST_SEND_FAILED'));
        }
      });
    }
  }

  window.CENTRAL_BACKEND = Object.freeze({
    BRIDGE_URL,
    BridgeClient,
    BridgeError
  });
})();
