export const articles = [
  {
    id: 2,
    title:
      "Building an Embeddable Payment Checkout Widget with Preact and TypeScript",
    slug: "building-embeddable-payment-checkout-widget-preact-typescript",
    description:
      "A comprehensive guide to building a production-ready, embeddable payment checkout widget using Preact and TypeScript. Learn how to create a secure JavaScript SDK with iframe communication, cryptographic handshake, and extend it to React, Vue, Angular packages and CMS plugins.",
    tags: [
      "Preact",
      "TypeScript",
      "JavaScript",
      "SDK",
      "Web Development",
      "Security",
    ],
    image: null,
    publishedDate: "2024-11-26",
    content: `
# Building an Embeddable Payment Checkout Widget with Preact and TypeScript

## Introduction

In this article, we'll explore how to build a production-ready, embeddable payment checkout widget using Preact and TypeScript. This widget can be embedded in any third-party website via a simple JavaScript SDK, opening in an iframe with secure communication between the parent window and the widget.

We'll walk through the complete architecture, from the JavaScript SDK to the Preact application, and show you how to extend this pattern to create packages for React, Vue, Angular, and even CMS plugins.

---

## Architecture Overview

The checkout widget follows a three-layer architecture:

### 1. **JavaScript SDK Layer** (\`dev/app.js\`)
- Provides the \`PaymentPopUp()\` function that third-party websites call
- Creates and manages the iframe containing the widget
- Handles secure communication via cryptographic handshake
- Listens for messages from the iframe and triggers callbacks

### 2. **Entry Point Layer** (\`dev/index.js\`, \`src/loader.ts\`, \`src/index.ts\`)
- Receives payment data from the SDK via \`window.postMessage\`
- Validates and sanitizes the data
- Initializes the Preact application with the payment configuration

### 3. **Preact Application Layer** (\`src/layout/Main.tsx\` and other components)
- Renders the payment UI
- Handles payment processing logic
- Communicates results back to the parent window

**Data Flow:**
\`\`\`
Third-Party Website → SDK (dev/app.js) → iframe postMessage →
Entry Point (dev/index.js) → Preact App (src/index.ts, src/loader.ts) →
Main Component (src/layout/Main.tsx) → Payment Processing
\`\`\`

---

## Part 1: The JavaScript SDK (\`dev/app.js\`)

The SDK is the bridge between the third-party website and your payment widget. It's distributed as a minified JavaScript file that websites include via a \`<script>\` tag.

### Key Responsibilities:
1. Create an iframe to host the widget
2. Establish secure communication via cryptographic handshake
3. Send payment data to the iframe
4. Listen for payment results and trigger callbacks

### Core Implementation:

#### 1. Universal Module Definition (UMD)
The SDK uses UMD pattern to work in various environments:

\`\`\`javascript
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
\`\`\`

This ensures the SDK works with AMD loaders, CommonJS, and as a browser global.

#### 2. Creating the Iframe

\`\`\`javascript
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
\`\`\`

The iframe is positioned as a full-screen overlay with maximum z-index to appear above all content.

#### 3. Secure Handshake Mechanism

**Security Challenge:** The iframe doesn't know the parent window's origin in advance, and malicious actors could try to inject payment data via browser console.

**Solution:** Cryptographic handshake token

\`\`\`javascript
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
\`\`\`

The handshake ensures that:
- Only the legitimate iframe can receive payment data
- Console attackers cannot inject fake payment data
- Communication is cryptographically secure

#### 4. Sending Payment Data

\`\`\`javascript
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
\`\`\`

#### 5. Public API

\`\`\`javascript
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
\`\`\`

### Usage Example

\`\`\`html
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
\`\`\`

---

## Part 2: The Entry Point (\`dev/index.js\`)

The entry point runs inside the iframe and is responsible for:
1. Initiating the handshake with the parent window
2. Receiving and validating payment data
3. Calling the Preact widget with the data

### Key Implementation:

#### 1. Generating Handshake Token

\`\`\`javascript
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
\`\`\`

#### 2. Initiating Handshake

\`\`\`javascript
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
\`\`\`

#### 3. Validating Payment Data

\`\`\`javascript
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
\`\`\`

#### 4. Receiving and Processing Messages

\`\`\`javascript
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
\`\`\`

#### 5. Calling the Preact Widget

\`\`\`javascript
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
\`\`\`

---

## Part 3: The Loader (\`src/loader.ts\`)

The loader is responsible for initializing the Preact application when called from \`setupPayment\`.

**Purpose of \`src/loader.ts\`:**
- Provides a bridge between the vanilla JavaScript SDK and the Preact application
- Handles the widget lifecycle (initialization, method calls, events)
- Creates the DOM element for rendering the Preact app

### Key Implementation:

\`\`\`typescript
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
                targetElement.setAttribute('id', \`widget-\${instanceName}\`);

                // Render the Preact app into the element
                render(targetElement, loadedObject);

                // Store initialization state
                win[\`loaded-\${instanceName}\`] = true;
                break;

            default:
                throw new Error(\`Unsupported method \${method}\`);
        }
    };
};
\`\`\`

---

## Part 4: The Preact Entry Point (\`src/index.ts\`)

This is where the Preact application is initialized and rendered.

**Purpose of \`src/index.ts\`:**
- Defines default configuration for the widget
- Calls the loader with the Preact rendering function
- Acts as the main entry point for the Preact application

### Implementation:

\`\`\`typescript
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
\`\`\`

The loader is called with a render function that uses Preact's \`h()\` function to create the App component and \`render()\` to mount it to the DOM.

---

## Part 5: The Main Payment Logic (\`src/layout/Main.tsx\`)

The Main component is the heart of the payment widget. It handles:
1. Fetching checkout details or creating checkout links
2. Managing payment state
3. Rendering payment UI
4. Communicating results back to parent window

**Purpose of \`src/layout/Main.tsx\`:**
- Central orchestrator for the entire payment flow
- Manages API calls to fetch/create checkout data
- Provides context to child components
- Handles routing between different payment screens

### Key Implementation:

\`\`\`typescript
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
\`\`\`

---

## Conclusion

In this article, we've explored how to build a production-ready embeddable payment widget using Preact and TypeScript. We covered:

1. **The JavaScript SDK** - Creating a secure, cross-origin communication layer with cryptographic handshake
2. **The Entry Point** - Validating and sanitizing payment data before initializing the widget
3. **The Loader** - Bridging vanilla JavaScript and Preact
4. **The Preact App** - Building the payment UI and handling business logic
5. **Complete Data Flow** - Understanding how all pieces work together

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
    `.trim(),
  },

  {
    id: 2,
    title: "Exploring an AI-Powered Support Desk Built with Rails and Hotwire",
    slug: "ai-powered-support-desk-rails-hotwire",
    description:
      "An idea to build a lightweight AI-driven support desk using Rails, Hotwire, background jobs, and an LLM client; focusing on multi-tenant workspaces, real-time ticket updates, and automated ticket summarisation for a modern support workflow.",
    tags: ["Rails", "Hotwire", "AI", "Background Jobs", "LLM", "PostgreSQL"],
    image: null,
    publishedDate: "2025-12-03",
    content: ``,
    url: "https://github.com/codziller/ai_support_desk",
  },

  //   {
  //     id: 1,
  //     title: "Building Scalable Microservices with Node.js and GraphQL",
  //     slug: "building-scalable-microservices-nodejs-graphql",
  //     description:
  //       "A deep dive into architecting microservices using Node.js and GraphQL, covering best practices, patterns, and real-world examples from building POS systems.",
  //     tags: ["Node.js", "GraphQL", "Microservices", "Architecture"],
  //     image: null,
  //     publishedDate: "2024-11-15",
  //     content: `
  //   # Building Scalable Microservices with Node.js and GraphQL

  //   Microservices architecture has become the de facto standard for building scalable applications. In this article, I'll share insights from building POS tools at Bani Africa.

  //   ## Why Microservices?

  //   Microservices allow teams to develop, deploy, and scale services independently...

  //   ## GraphQL vs REST

  //   GraphQL provides several advantages over traditional REST APIs:
  //   - Single endpoint for all data requirements
  //   - Strong typing
  //   - Efficient data fetching

  //   ## Best Practices

  //   1. **Service Isolation**: Each microservice should be independently deployable
  //   2. **API Gateway**: Use an API gateway to manage cross-cutting concerns
  //   3. **Data Ownership**: Each service owns its data

  //   ## Conclusion

  //   Building microservices requires careful planning and the right tools. Node.js and GraphQL provide an excellent foundation for scalable systems.
  //       `.trim(),
  //   },
  //   {
  //     id: 3,
  //     title: "Optimizing CI/CD Pipelines: Reducing Deployment Time by 60%",
  //     slug: "optimizing-cicd-pipelines",
  //     description:
  //       "Learn how I reduced deployment times by 60% using GitHub Actions and Docker, with practical examples and configuration templates.",
  //     tags: ["CI/CD", "GitHub Actions", "Docker", "DevOps"],
  //     image: null,
  //     publishedDate: "2024-10-20",
  //     content: `
  // # Optimizing CI/CD Pipelines: Reducing Deployment Time by 60%

  // Slow deployments kill productivity. Here's how we cut deployment time from 25 minutes to 10 minutes.

  // ## The Problem

  // Our original pipeline had several bottlenecks:
  // - Full dependency reinstallation on every run
  // - Sequential test execution
  // - Large Docker images

  // ## The Solution

  // ### 1. Dependency Caching
  // We implemented aggressive caching strategies...

  // ### 2. Parallel Testing
  // Breaking tests into parallel jobs...

  // ### 3. Multi-stage Docker Builds
  // Optimizing Docker images reduced build time significantly...

  // ## Results

  // - 60% reduction in deployment time
  // - 40% reduction in Docker image size
  // - Improved developer experience
  //     `.trim(),
  //   },
  //   {
  //     id: 4,
  //     title: "Web3 Development: Building NFT Dashboards",
  //     slug: "web3-development-nft-dashboards",
  //     description:
  //       "My experience building Web3 interfaces for Metamask and Solana, including wallet integration and NFT minting functionality.",
  //     tags: ["Web3", "React", "NFT", "Blockchain"],
  //     image: null,
  //     publishedDate: "2024-09-05",
  //     content: `
  // # Web3 Development: Building NFT Dashboards

  // Web3 development presents unique challenges. Here's what I learned building NFT dashboards for Fort Knox DAO.

  // ## Wallet Integration

  // Integrating with Metamask and Solana wallets requires careful handling of async operations and user permissions...

  // ## NFT Minting

  // Building an intuitive minting interface involves...

  // ## Lessons Learned

  // 1. Always handle wallet disconnections gracefully
  // 2. Gas estimation is crucial for UX
  // 3. Transaction states need clear feedback

  // ## Conclusion

  // Web3 development is exciting but requires attention to detail and user experience.
  //     `.trim(),
  //   },
];
