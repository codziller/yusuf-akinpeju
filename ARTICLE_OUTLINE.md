# Building an Embeddable Payment Checkout Widget with Preact and TypeScript

## Introduction

In this article, we'll explore how to build a production-ready, embeddable payment checkout widget using Preact and TypeScript. This widget can be embedded in any third-party website via a simple JavaScript SDK, opening in an iframe with secure communication between the parent window and the widget.

We'll walk through the complete architecture, from the JavaScript SDK to the Preact application, and show you how to extend this pattern to create packages for React, Vue, Angular, and even CMS plugins.

---

## Architecture Overview

The checkout widget follows a three-layer architecture:

### 1. **JavaScript SDK Layer** (`dev/app.js`)
- Provides the `PaymentPopUp()` function that third-party websites call
- Creates and manages the iframe containing the widget
- Handles secure communication via cryptographic handshake
- Listens for messages from the iframe and triggers callbacks

### 2. **Entry Point Layer** (`dev/index.js`, `src/loader.ts`, `src/index.ts`)
- Receives payment data from the SDK via `window.postMessage`
- Validates and sanitizes the data
- Initializes the Preact application with the payment configuration

### 3. **Preact Application Layer** (`src/layout/Main.tsx` and other components)
- Renders the payment UI
- Handles payment processing logic
- Communicates results back to the parent window

**Data Flow:**
```
Third-Party Website → SDK (dev/app.js) → iframe postMessage →
Entry Point (dev/index.js) → Preact App (src/index.ts, src/loader.ts) →
Main Component (src/layout/Main.tsx) → Payment Processing
```

---

## Part 1: The JavaScript SDK (`dev/app.js`)

The SDK is the bridge between the third-party website and your payment widget. It's distributed as a minified JavaScript file that websites include via a `<script>` tag.

### Key Responsibilities:
1. Create an iframe to host the widget
2. Establish secure communication via cryptographic handshake
3. Send payment data to the iframe
4. Listen for payment results and trigger callbacks

### Core Implementation:

#### 1. Universal Module Definition (UMD)
The SDK uses UMD pattern to work in various environments:

```javascript
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory(root));
    } else if (typeof exports === "object") {
        module.exports = factory(root);
    } else {
        root.paymentPlugin = factory(root);
    }
})(
    typeof global !== "undefined" ? global : this.window || this.global,
    function (root) {
        "use strict";

        var paymentPlugin = {}; // Object for public APIs

        // ... SDK implementation

        window["PaymentPopUp"] = (options) => {
            paymentPlugin.init(options);
        };

        return paymentPlugin;
    }
);
```

This ensures the SDK works with AMD loaders, CommonJS, and as a browser global.

#### 2. Creating the Iframe

```javascript
const createIframe = (options) => {
    // Determine iframe URL based on environment
    currentIframeOrigin = getIframeOrigin(options?.merchantKey);
    const iframeSrc = currentIframeOrigin + "/";

    const iframe = document.createElement("iframe");
    const iframeStyle = "z-index: 9999999999; background: transparent; " +
        "border: 0px none transparent; position: fixed; left: 0px; top: 0px; " +
        "width: 100%; height: 100%; display:block;";

    iframe.setAttribute("src", iframeSrc);
    iframe.setAttribute("style", iframeStyle);
    iframe.setAttribute("id", appFrameId);
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("allowpaymentrequest", "true");
    iframe.setAttribute("sandbox",
        "allow-forms allow-scripts allow-same-origin " +
        "allow-top-navigation-by-user-activation allow-popups");

    return iframe;
};
```

The iframe is positioned as a full-screen overlay with maximum z-index to appear above all content.

#### 3. Secure Handshake Mechanism

**Security Challenge:** The iframe doesn't know the parent window's origin in advance, and malicious actors could try to inject payment data via browser console.

**Solution:** Cryptographic handshake token

```javascript
// SECURITY: Handshake variables
let handshakeToken = null;
let handshakeComplete = false;
let pendingSettings = null;

const handleMessages = (event) => {
    let message = event?.data?.type || event?.data;

    // Handle handshake initialization from iframe
    if (message === "IFRAME_HANDSHAKE_INIT") {
        if (event.data?.handshakeToken) {
            handshakeToken = event.data.handshakeToken;
            handshakeComplete = true;

            console.log("[SECURITY] Handshake complete with iframe");

            // Send acknowledgment back to iframe
            const iframe = document.getElementById(appFrameId);
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                    {
                        type: "HANDSHAKE_ACK",
                        handshakeToken: handshakeToken,
                        timestamp: Date.now(),
                    },
                    event.origin
                );

                // Send payment data now that handshake is complete
                sendPaymentDataToIframe();
            }
        }
        return;
    }

    // Only process other messages if handshake is complete
    if (!handshakeComplete) {
        return;
    }

    // Process payment callbacks
    switch (message) {
        case "CALLBACK":
            onCallback && onCallback({ ...event.data.response });
            break;
        case "ONCLOSE":
            hideIframe();
            onClose && onClose({ ...event.data.response });
            break;
        // ... other cases
    }
};
```

The handshake ensures that:
- Only the legitimate iframe can receive payment data
- Console attackers cannot inject fake payment data
- Communication is cryptographically secure

#### 4. Sending Payment Data

```javascript
const sendPaymentDataToIframe = () => {
    if (!handshakeComplete || !handshakeToken || !pendingSettings) {
        console.warn("[SECURITY] Cannot send payment data - handshake not complete");
        return;
    }

    const iframe = document.getElementById(appFrameId);

    // Remove function properties from settings
    const settingsCopy = { ...pendingSettings };
    const optionKeys = Object.keys(settingsCopy);
    for (let i = 0; i < optionKeys.length; i++) {
        if (typeof settingsCopy[optionKeys[i]] === "function") {
            delete settingsCopy[optionKeys[i]];
        }
    }

    // Include handshake token for validation
    const messagePayload = {
        ...settingsCopy,
        checkoutReady: true,
        handshakeToken: handshakeToken,
        timestamp: Date.now(),
    };

    iframe.contentWindow.postMessage(messagePayload, currentIframeOrigin);
};
```

#### 5. Public API

```javascript
paymentPlugin.init = function (options) {
    // Reset handshake state
    handshakeToken = null;
    handshakeComplete = false;

    // Create and show iframe
    showIframe(createIframe(options));
    showLoaderIframe(); // Show loading spinner

    // Store settings and callbacks
    settings = { ...options };
    onClose = options?.onClose;
    onCallback = options?.callback;
    pendingSettings = { ...settings };

    console.log("[SECURITY] Waiting for iframe handshake...");
};

// Expose as global function
window["PaymentPopUp"] = (options) => {
    paymentPlugin.init(options);
};
```

### Usage Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Demo</title>
</head>
<body>
    <button onclick="pay()">Pay Now</button>

    <!-- Include the SDK -->
    <script src="https://cdn.yourcompany.com/widget.min.js"></script>

    <script>
        function pay() {
            PaymentPopUp({
                merchantKey: 'pk_test_xxxxxxxxxxxxx',
                amount: 15000,
                currency: 'USD',
                email: 'customer@example.com',
                phoneNumber: '+1234567890',
                firstName: 'John',
                lastName: 'Doe',
                provider: 'STRIPE',
                callback: (response) => {
                    console.log('Payment successful!', response);
                },
                onClose: (response) => {
                    console.log('Widget closed', response);
                }
            });
        }
    </script>
</body>
</html>
```

---

## Part 2: The Entry Point (`dev/index.js`)

The entry point runs inside the iframe and is responsible for:
1. Initiating the handshake with the parent window
2. Receiving and validating payment data
3. Calling the Preact widget with the data

### Key Implementation:

#### 1. Generating Handshake Token

```javascript
/**
 * Generate cryptographically secure handshake token
 * Console attackers cannot obtain this token as it's generated inside the iframe
 */
const generateHandshakeToken = () => {
    const array = new Uint8Array(32); // 256-bit token
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(array);
        return Array.from(array, byte =>
            byte.toString(16).padStart(2, '0')
        ).join('');
    } else {
        // Fallback for older browsers
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 64; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
};
```

#### 2. Initiating Handshake

```javascript
const initiateHandshake = () => {
    if (window.parent === window) {
        console.warn("[SECURITY] Not running in iframe, handshake not required");
        return;
    }

    handshakeToken = generateHandshakeToken();
    console.log("[SECURITY] Initiating handshake with parent window");

    // Send handshake token to parent
    // We use '*' as we don't know parent origin (that's the whole point!)
    window.parent.postMessage({
        type: 'IFRAME_HANDSHAKE_INIT',
        handshakeToken: handshakeToken,
        timestamp: Date.now()
    }, '*');
};

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    initiateHandshake();
});
```

#### 3. Validating Payment Data

```javascript
const validatePaymentData = (data) => {
    const errors = [];

    // Check if checkoutLinkCode is provided
    const hasCheckoutLinkCode = data.checkoutLinkCode &&
        typeof data.checkoutLinkCode === "string";

    if (!hasCheckoutLinkCode) {
        // Required fields validation
        if (!data.merchantKey || typeof data.merchantKey !== "string") {
            errors.push("Invalid or missing merchantKey");
        }
        if (!data.amount || typeof data.amount !== "number" || data.amount <= 0) {
            errors.push("Invalid or missing amount");
        }
        if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
            errors.push("Invalid or missing email");
        }
        if (!data.phoneNumber || typeof data.phoneNumber !== "string") {
            errors.push("Invalid or missing phoneNumber");
        }
    }

    // CRITICAL: Validate handshake token
    if (!data.handshakeToken || data.handshakeToken !== handshakeToken) {
        errors.push("Invalid or missing handshake token");
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
};
```

#### 4. Receiving and Processing Messages

```javascript
const handleMessages = async (event) => {
    let message = event?.data;

    // Handle handshake acknowledgment
    if (message?.type === 'HANDSHAKE_ACK' &&
        message?.handshakeToken === handshakeToken) {
        if (!handshakeComplete) {
            handshakeComplete = true;
            trustedParentSource = event.source;
            console.log("[SECURITY] Handshake completed with parent");
        }
        return;
    }

    // All other messages must come after handshake
    if (!handshakeComplete) {
        return; // Reject messages before handshake
    }

    // Validate message source
    if (event.source !== trustedParentSource) {
        return; // Reject messages from untrusted sources
    }

    if (message?.checkoutReady) {
        // Validate payment data
        const validation = validatePaymentData(message);

        if (!validation.isValid) {
            console.error("[SECURITY] Invalid payment data:", validation.errors);
            return;
        }

        // Sanitize data
        const sanitizedData = {
            merchantKey: message.merchantKey ? String(message.merchantKey).trim() : undefined,
            amount: message.amount ? Number(message.amount) : undefined,
            email: message.email ? String(message.email).trim() : undefined,
            // ... sanitize all fields
            timestamp: Date.now(),
        };

        console.log("[SECURITY] Payment data validated and sanitized");

        // Call the Preact widget
        await setupPayment(sanitizedData);
    }
};

// Listen for messages
window.addEventListener("message", handleMessages);
```

#### 5. Calling the Preact Widget

```javascript
window["setupPayment"] = async (data) => {
    // Wait for widget to be available
    await waitForWidget();

    // Call the Preact widget initialization
    if (window.PaymentPop) {
        PaymentPop("init", { ...data });
    } else if (window.PaymentPopUp) {
        PaymentPopUp({ ...data });
    }
};
```

---

## Part 3: The Loader (`src/loader.ts`)

The loader is responsible for initializing the Preact application when called from `setupPayment`.

**Purpose of `src/loader.ts`:**
- Provides a bridge between the vanilla JavaScript SDK and the Preact application
- Handles the widget lifecycle (initialization, method calls, events)
- Creates the DOM element for rendering the Preact app

### Key Implementation:

```typescript
export default async (
    win: Window,
    defaultConfig: Configurations,
    scriptElement: Element | null,
    render: (element: HTMLElement, config: Configurations) => void
) => {
    // Convert async initialization to sync method calls
    win['PaymentPop'] = async (method: MethodNames, args: any) => {
        await setup(method, args);
    };

    const setup = (method: MethodNames, args: any) => {
        let targetElement: HTMLElement;
        const instanceName = 'aw1';

        switch (method) {
            case 'init':
                // Merge default config with user config
                const loadedObject = Object.assign(defaultConfig, args);

                // Remove any previous widget instance
                let prevModal = document.getElementById('widget-aw1');
                if (prevModal) {
                    prevModal.remove();
                }

                // Create wrapper element
                const wrappingElement = loadedObject.element ?? win.document.body;
                targetElement = wrappingElement.appendChild(
                    win.document.createElement('div')
                );
                targetElement.setAttribute('id', `widget-${instanceName}`);

                // Render the Preact app into the element
                render(targetElement, loadedObject);

                // Store initialization state
                win[`loaded-${instanceName}`] = true;
                break;

            default:
                throw new Error(`Unsupported method ${method}`);
        }
    };
};
```

---

## Part 4: The Preact Entry Point (`src/index.ts`)

This is where the Preact application is initialized and rendered.

**Purpose of `src/index.ts`:**
- Defines default configuration for the widget
- Calls the loader with the Preact rendering function
- Acts as the main entry point for the Preact application

### Implementation:

```typescript
import { h, render } from 'preact';
import { App } from './App';
import loader from './loader';
import { Configurations } from './models';

/**
 * Default configurations that are overridden by
 * parameters in embedded script.
 */
const defaultConfig: Configurations = {
    debug: true,
    merchantKey: '',
    amount: 0,
    currency: '',
    title: '',
    description: '',
    provider: '',

    // Customer details
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',

    // Callback functions
    onClose: () => {},
    callback: () => {},

    // UI customization
    minimized: false,
    disableDarkMode: false,
    hideLogo: false,

    text: {},
    styles: {},
};

// Main entry point - call loader and render Preact app
loader(
    window,
    defaultConfig,
    window.document.currentScript,
    (el, config) => render(h(App, { ...config, element: el }), el)
);
```

The loader is called with a render function that uses Preact's `h()` function to create the App component and `render()` to mount it to the DOM.

---

## Part 5: The Main Payment Logic (`src/layout/Main.tsx`)

The Main component is the heart of the payment widget. It handles:
1. Fetching checkout details or creating checkout links
2. Managing payment state
3. Rendering payment UI
4. Communicating results back to parent window

**Purpose of `src/layout/Main.tsx`:**
- Central orchestrator for the entire payment flow
- Manages API calls to fetch/create checkout data
- Provides context to child components
- Handles routing between different payment screens

### Key Responsibilities:

#### 1. Initialization Logic

```typescript
useEffect(() => {
    const {
        checkoutLinkCode,
        firstName, lastName, email, phoneNumber,
        merchantKey, amount, currency, title, description, provider
    } = props;

    // Two modes of operation:
    // Mode 1: checkoutLinkCode provided → fetch existing checkout
    // Mode 2: payment details provided → create new checkout link

    (async () => {
        try {
            if (checkoutLinkCode) {
                // MODE 1: Fetch existing checkout details
                const checkoutDetailsResponse =
                    await service?.getCheckoutDetails(checkoutLinkCode);

                if (checkoutDetailsResponse) {
                    const { merchant, orderSummary, paymentMethods, redirectUrls } =
                        checkoutDetailsResponse;

                    // Notify parent about successful fetch
                    window.parent.postMessage({
                        type: 'CHECKOUT_DETAILS_FETCHED',
                        response: { checkoutLinkId: orderSummary.id },
                    }, '*');

                    // Convert API response to app state
                    const userAppData = {
                        pay_amount: orderSummary.amount,
                        pay_currency: orderSummary.currency,
                        holder_email: orderSummary.customerEmail,
                        checkoutLink: { ...orderSummary },
                        merchant: { ...merchant },
                        redirectUrls: redirectUrls || null,
                        // ... more fields
                    };

                    setUser(userAppData);
                    setLoading(false);
                    window.parent.postMessage('CHECKOUTREADY', '*');
                }
            } else {
                // MODE 2: Create new checkout link
                const checkoutLinkBody = {
                    title,
                    amount,
                    currency,
                    provider,
                    customer: { firstName, lastName, email, phoneNumber },
                };

                const checkoutLinkResponse =
                    await service?.createCheckoutLink(checkoutLinkBody);

                if (checkoutLinkResponse?.link) {
                    // Notify parent about successful creation
                    window.parent.postMessage({
                        type: 'CHECKOUT_LINK_CREATED',
                        response: {
                            checkoutLinkId: checkoutLinkResponse.link.id,
                            shareUrl: checkoutLinkResponse.link.shareUrl,
                        },
                    }, '*');

                    // Convert API response to app state
                    const userAppData = {
                        pay_amount: amount,
                        pay_currency: currency,
                        checkoutLink: checkoutLinkResponse.link,
                        merchant: checkoutLinkResponse.merchant,
                        redirectUrls: checkoutLinkResponse.redirectUrls || null,
                        // ... more fields
                    };

                    setUser(userAppData);
                    setLoading(false);
                    window.parent.postMessage('CHECKOUTREADY', '*');
                }
            }
        } catch (error) {
            handleError(error);
        }
    })();
}, [service]);
```

#### 2. Rendering the UI

```typescript
return (
    <main className={clsx(style.main, mainStyle.backdrop)}>
        {loading ? (
            <div className={style.loader}></div>
        ) : (
            <div className={style.container}>
                <div id="paymentPopupRoot" className={style.root}>
                    {showTitle && <TitleBar {...{ showBack, goBack, route }} />}

                    {/* Test mode banner */}
                    {props?.merchantKey?.includes('pk_test') && (
                        <div className={mainStyle['test-mode-banner']}>
                            Test mode: payments here are not live
                        </div>
                    )}

                    {/* Router for different screens */}
                    <Router
                        route={route}
                        setRoute={setRoute}
                        routes={{
                            '/': <RouteComponent component={Home} />,
                            '/payment': <RouteComponent component={PaymentHandler} />,
                            '/paymentSuccess': <RouteComponent component={PaymentSuccess} />,
                            '/paymentFailed': <RouteComponent component={PaymentFailed} />,
                        }}
                    />
                </div>
            </div>
        )}
    </main>
);
```

#### 3. Payment Callback Communication

Payment pages communicate results back to the parent window:

```typescript
// In payment components (e.g., StripePayment.tsx, PayPalPayment.tsx)

// On successful payment
const closeModal = (messageType: string, data: any) => {
    const message = {
        type: messageType, // 'CALLBACK' for success
        response: {
            status: 'success',
            reference: paymentReference,
            amount: user.pay_amount,
            currency: user.pay_currency,
            redirectUrls: user.redirectUrls, // Include redirect URLs
            ...data
        }
    };

    window.parent.postMessage(message, '*');

    // Handle redirect if successUrl is provided
    if (user.redirectUrls?.successUrl) {
        window.top.location.href = user.redirectUrls.successUrl;
    }
};

// On payment failure
const handleFailure = (error: any) => {
    const message = {
        type: 'ONCLOSE',
        response: {
            status: 'failed',
            error: error.message,
            redirectUrls: user.redirectUrls,
        }
    };

    window.parent.postMessage(message, '*');

    // Handle redirect if failureUrl is provided
    if (user.redirectUrls?.failureUrl) {
        window.top.location.href = user.redirectUrls.failureUrl;
    }
};
```

---

## Part 6: Complete Data Flow Example

Let's trace a complete payment flow from start to finish:

### Step 1: User clicks "Pay" on merchant website

```javascript
// merchant-website.html
PaymentPopUp({
    merchantKey: 'pk_test_xxxxx',
    amount: 15000,
    currency: 'USD',
    email: 'user@example.com',
    phoneNumber: '+1234567890',
    firstName: 'John',
    lastName: 'Doe',
    provider: 'STRIPE',
    callback: (response) => {
        console.log('Payment successful!', response);
        // Handle successful payment
    },
    onClose: (response) => {
        console.log('Widget closed', response);
        // Handle close/failure
    }
});
```

### Step 2: SDK creates iframe and initiates handshake

```
[dev/app.js]
1. paymentPlugin.init() is called
2. Creates iframe pointing to https://checkout.yourcompany.com/
3. Stores payment data in pendingSettings
4. Waits for handshake from iframe
```

### Step 3: Iframe loads and initiates handshake

```
[dev/index.js - inside iframe]
1. Page loads, DOMContentLoaded fires
2. generateHandshakeToken() creates 256-bit token
3. Sends IFRAME_HANDSHAKE_INIT message to parent with token
4. Waits for HANDSHAKE_ACK from parent
```

### Step 4: SDK completes handshake and sends payment data

```
[dev/app.js]
1. Receives IFRAME_HANDSHAKE_INIT message
2. Stores handshakeToken
3. Sends HANDSHAKE_ACK back to iframe
4. Calls sendPaymentDataToIframe()
5. Posts payment data + handshakeToken to iframe
```

### Step 5: Iframe validates and initializes widget

```
[dev/index.js]
1. Receives payment data message
2. Validates handshakeToken matches
3. Validates payment data fields
4. Sanitizes all inputs
5. Calls setupPayment(sanitizedData)
```

### Step 6: Preact widget initializes

```
[src/loader.ts]
1. PaymentPop('init', data) is called
2. Creates div element for widget
3. Calls render function from src/index.ts

[src/index.ts]
4. Preact's render() mounts App component
5. App component renders Main component with data
```

### Step 7: Main component fetches checkout data

```
[src/layout/Main.tsx]
1. useEffect runs on mount
2. Calls service.createCheckoutLink(data)
3. Receives checkout link + merchant details + payment methods
4. Updates user state with all data
5. Posts CHECKOUTREADY message to parent
6. Renders Home component (payment options)
```

### Step 8: SDK hides loader, shows widget

```
[dev/app.js]
1. Receives CHECKOUTREADY message
2. Calls fadeLoaderIframe() and hideLoaderIframe()
3. Widget is now fully visible and interactive
```

### Step 9: User completes payment

```
[src/routes/payments/StripePayment.tsx (or other provider)]
1. User enters payment details
2. Payment is processed
3. On success: closeModal('CALLBACK', successData)
4. Posts message to parent with type: 'CALLBACK'
```

### Step 10: SDK triggers callback

```
[dev/app.js]
1. Receives message with type: 'CALLBACK'
2. Calls onCallback callback function
3. Merchant's callback() function executes
4. Merchant can now show success message, redirect, etc.
```

---

## Part 7: Building and Distributing the SDK

### Build Process

The widget is built in two steps:

1. **Build the Preact app** (creates the widget bundle)
```bash
npm run build
```

This creates optimized bundles in the `build/` directory.

2. **Minify the SDK** (creates the distributable SDK file)
```bash
# Minify dev/app.js to demo/index.min.js
npm run minify
# or use a tool like:
npx terser dev/app.js -o demo/index.min.js --compress --mangle
```

### Distribution

The minified SDK (`index.min.js`) is what you distribute to merchants:

```html
<!-- Merchant includes your SDK -->
<script src="https://cdn.yourcompany.com/widget.min.js"></script>

<script>
    // Now they can use PaymentPopUp
    PaymentPopUp({ /* config */ });
</script>
```

---

## Part 8: Taking It Further

### 1. Creating Framework-Specific Packages

The SDK can be wrapped into framework-specific packages for better developer experience:

#### React Package (`@yourcompany/checkout-react`)

```typescript
// src/index.tsx
import { useEffect, useRef } from 'react';

export interface PaymentCheckoutProps {
    merchantKey: string;
    amount: number;
    currency: string;
    email: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    provider: string;
    onSuccess?: (response: any) => void;
    onClose?: (response: any) => void;
}

export const usePaymentCheckout = () => {
    const initializePayment = (config: PaymentCheckoutProps) => {
        if (typeof window !== 'undefined' && (window as any).PaymentPopUp) {
            (window as any).PaymentPopUp({
                ...config,
                callback: config.onSuccess,
                onClose: config.onClose,
            });
        }
    };

    return { initializePayment };
};

export const PaymentCheckoutButton: React.FC<
    PaymentCheckoutProps & { children: React.ReactNode }
> = ({ children, onSuccess, onClose, ...config }) => {
    const { initializePayment } = usePaymentCheckout();

    return (
        <button onClick={() => initializePayment({ ...config, onSuccess, onClose })}>
            {children}
        </button>
    );
};

// Script loader component
export const PaymentCheckoutScript: React.FC = () => {
    const scriptLoaded = useRef(false);

    useEffect(() => {
        if (scriptLoaded.current) return;

        const script = document.createElement('script');
        script.src = 'https://cdn.yourcompany.com/widget.min.js';
        script.async = true;
        document.body.appendChild(script);

        scriptLoaded.current = true;

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return null;
};
```

**Usage:**
```tsx
import { PaymentCheckoutScript, PaymentCheckoutButton } from '@yourcompany/checkout-react';

function App() {
    return (
        <>
            <PaymentCheckoutScript />
            <PaymentCheckoutButton
                merchantKey="pk_test_xxxxx"
                amount={15000}
                currency="USD"
                email="user@example.com"
                phoneNumber="+1234567890"
                provider="STRIPE"
                onSuccess={(response) => console.log('Success!', response)}
                onClose={(response) => console.log('Closed', response)}
            >
                Pay Now
            </PaymentCheckoutButton>
        </>
    );
}
```

#### Vue Package (`@yourcompany/checkout-vue`)

```typescript
// src/index.ts
import { App } from 'vue';

export interface PaymentCheckoutConfig {
    merchantKey: string;
    amount: number;
    currency: string;
    email: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    provider: string;
}

export const PaymentCheckoutPlugin = {
    install(app: App) {
        // Load SDK script
        if (typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.yourcompany.com/widget.min.js';
            script.async = true;
            document.body.appendChild(script);
        }

        // Add global method
        app.config.globalProperties.$paymentCheckout = (config: PaymentCheckoutConfig) => {
            if ((window as any).PaymentPopUp) {
                (window as any).PaymentPopUp(config);
            }
        };
    },
};

// Composable
export const usePaymentCheckout = () => {
    const initializePayment = (config: PaymentCheckoutConfig) => {
        if ((window as any).PaymentPopUp) {
            (window as any).PaymentPopUp(config);
        }
    };

    return { initializePayment };
};
```

**Usage:**
```vue
<template>
    <button @click="pay">Pay Now</button>
</template>

<script setup>
import { usePaymentCheckout } from '@yourcompany/checkout-vue';

const { initializePayment } = usePaymentCheckout();

const pay = () => {
    initializePayment({
        merchantKey: 'pk_test_xxxxx',
        amount: 15000,
        currency: 'USD',
        email: 'user@example.com',
        phoneNumber: '+2347012345678',
        provider: 'STRIPE',
        callback: (response) => console.log('Success!', response),
        onClose: (response) => console.log('Closed', response),
    });
};
</script>
```

#### Angular Package (`@yourcompany/checkout-angular`)

```typescript
// src/lib/payment-checkout.service.ts
import { Injectable } from '@angular/core';

export interface PaymentCheckoutConfig {
    merchantKey: string;
    amount: number;
    currency: string;
    email: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    provider: string;
    callback?: (response: any) => void;
    onClose?: (response: any) => void;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentCheckoutService {
    private scriptLoaded = false;

    constructor() {
        this.loadScript();
    }

    private loadScript(): void {
        if (this.scriptLoaded) return;

        const script = document.createElement('script');
        script.src = 'https://cdn.yourcompany.com/widget.min.js';
        script.async = true;
        document.body.appendChild(script);
        this.scriptLoaded = true;
    }

    initializePayment(config: PaymentCheckoutConfig): void {
        if ((window as any).PaymentPopUp) {
            (window as any).PaymentPopUp(config);
        }
    }
}
```

**Usage:**
```typescript
import { Component } from '@angular/core';
import { PaymentCheckoutService } from '@yourcompany/checkout-angular';

@Component({
    selector: 'app-payment',
    template: '<button (click)="pay()">Pay Now</button>'
})
export class PaymentComponent {
    constructor(private payment: PaymentCheckoutService) {}

    pay() {
        this.payment.initializePayment({
            merchantKey: 'pk_test_xxxxx',
            amount: 15000,
            currency: 'USD',
            email: 'user@example.com',
            phoneNumber: '+2347012345678',
            provider: 'STRIPE',
            callback: (response) => console.log('Success!', response),
            onClose: (response) => console.log('Closed', response),
        });
    }
}
```

### 2. Creating CMS Plugins

The same SDK can power plugins for popular CMS platforms:

#### WordPress WooCommerce Plugin

```php
<?php
/**
 * Plugin Name: Custom Payment Gateway
 * Description: Accept payments via custom payment widget
 * Version: 1.0.0
 */

add_action('plugins_loaded', 'init_custom_gateway');

function init_custom_gateway() {
    class WC_Gateway_Custom extends WC_Payment_Gateway {
        public function __construct() {
            $this->id = 'custom_payment';
            $this->method_title = 'Custom Payment';
            $this->method_description = 'Accept payments via custom widget';

            $this->init_form_fields();
            $this->init_settings();

            $this->title = $this->get_option('title');
            $this->merchant_key = $this->get_option('merchant_key');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id,
                array($this, 'process_admin_options'));
            add_action('wp_enqueue_scripts', array($this, 'payment_scripts'));
        }

        public function payment_scripts() {
            wp_enqueue_script('custom-checkout',
                'https://cdn.yourcompany.com/widget.min.js',
                array(), null, true);
        }

        public function process_payment($order_id) {
            $order = wc_get_order($order_id);

            return array(
                'result' => 'success',
                'redirect' => $order->get_checkout_payment_url(true)
            );
        }
    }
}

add_filter('woocommerce_payment_gateways', 'add_custom_gateway');
function add_custom_gateway($gateways) {
    $gateways[] = 'WC_Gateway_Custom';
    return $gateways;
}
```

#### Shopify App

```javascript
// Shopify app with embedded checkout
import { Checkout } from '@shopify/checkout-ui-extensions';

export default function CheckoutExtension({ extensionPoint }) {
    return (
        <Button
            onClick={() => {
                // Call payment widget SDK
                window.PaymentPopUp({
                    merchantKey: 'pk_test_xxxxx',
                    amount: checkout.totalPrice,
                    currency: checkout.currencyCode,
                    email: checkout.email,
                    phoneNumber: checkout.phone,
                    provider: 'STRIPE',
                    callback: (response) => {
                        // Mark order as paid in Shopify
                        completeCheckout(response);
                    }
                });
            }}
        >
            Pay Now
        </Button>
    );
}
```

### 3. Publishing to NPM

All these packages can be published to NPM for easy installation:

```bash
# React
npm install @yourcompany/checkout-react

# Vue
npm install @yourcompany/checkout-vue

# Angular
npm install @yourcompany/checkout-angular

# React Native (mobile)
npm install @yourcompany/checkout-react-native
```

---

## Conclusion

In this article, we've explored how to build a production-ready embeddable payment widget using Preact and TypeScript. We covered:

1. **The JavaScript SDK** - Creating a secure, cross-origin communication layer with cryptographic handshake
2. **The Entry Point** - Validating and sanitizing payment data before initializing the widget
3. **The Loader** - Bridging vanilla JavaScript and Preact
4. **The Preact App** - Building the payment UI and handling business logic
5. **Complete Data Flow** - Understanding how all pieces work together
6. **Distribution** - Building and deploying the SDK
7. **Extensions** - Creating framework packages and CMS plugins

### Key Takeaways:

- **Security First:** The handshake mechanism ensures secure communication between parent and iframe
- **Framework Agnostic:** The vanilla JS SDK works with any framework or CMS
- **Modular Architecture:** Separation of concerns makes the codebase maintainable
- **Extensible:** Easy to create wrapper packages for different ecosystems
- **Production Ready:** Handles error cases, validation, and edge cases

### Next Steps:

Now that you understand the architecture, you can:
- Build your own embeddable widget for any use case (checkout, forms, chat, etc.)
- Create NPM packages for React, Vue, Angular, and other frameworks
- Develop CMS plugins for WordPress, Shopify, Wix, and more
- Extend to mobile with React Native, Flutter, or native SDKs

The same principles apply whether you're building a payment widget, an authentication modal, a chat widget, or any embeddable component. The key is secure iframe communication and a clean SDK interface.

Happy coding!

---

## Resources

- **Preact Documentation:** https://preactjs.com
- **Window.postMessage API:** https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
- **Web Crypto API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **UMD Pattern:** https://github.com/umdjs/umd
- **NPM Publishing Guide:** https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages

---

## Appendix: File Structure Summary

```
payment-checkout-widget/
├── dev/
│   ├── app.js          # JavaScript SDK (creates iframe, handles communication)
│   └── index.js        # Entry point inside iframe (receives data, validates)
├── src/
│   ├── index.ts        # Preact entry point (initializes app)
│   ├── loader.ts       # Loader (bridges SDK and Preact)
│   ├── layout/
│   │   └── Main.tsx    # Main payment logic (fetches data, handles routing)
│   ├── routes/
│   │   ├── home/       # Payment options screen
│   │   └── payments/   # Payment provider components
│   └── components/     # Reusable UI components
├── demo/
│   ├── index.html      # Demo page
│   ├── client.js       # Demo usage example
│   └── index.min.js    # Minified SDK for distribution
└── build/              # Built Preact app (generated)
```

---

**Word Count:** ~5,800 words

This comprehensive outline provides everything you need to write your article, complete with code examples, architectural diagrams, and practical extensions. Good luck with your article!
