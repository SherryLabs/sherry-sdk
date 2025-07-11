# Triggers Integration Guide

## Overview

Trigger Kit is a powerful library for integrating blockchain mini-applications (miniapps) into your React applications. It provides a seamless way to import and execute blockchain actions through URLs or metadata objects, with full support for wagmi and various wallet connections.

## Installation

Install the required packages:

```bash
npm install @sherrylinks/slinks @sherrylinks/slinks-core
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install wagmi viem @tanstack/react-query framer-motion react react-dom
```

## Basic Setup

### 1. Import Required Styles

Add the Slinks CSS to your application:

```jsx
import '@sherrylinks/slinks/index.css';
```

### 2. Create a Wagmi Adapter

```jsx
import { createWagmiAdapter } from '@sherrylinks/slinks';
import { useConfig } from 'wagmi';

function MyApp() {
  const config = useConfig(); // Your wagmi config
  const adapter = createWagmiAdapter(config);
  
  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

### 3. Basic Trigger Component Usage

```jsx
import { Trigger } from '@sherrylinks/slinks';

function MyTriggerComponent() {
  return (
    <Trigger
      url="https://example.com/api/miniapp"
      adapter={adapter}
      enableAnalytics={true}
    />
  );
}
```

## Usage Methods

### Method 1: URL-Based Integration

Import mini-apps directly from URLs:

```jsx
import { Trigger } from '@sherrylinks/slinks';

function URLTrigger({ adapter }) {
  return (
    <Trigger
      url="https://api.sherry.social/v1/miniapp/example/metadata"
      adapter={adapter}
      enableAnalytics={true}
    />
  );
}
```

### Method 2: Directory API Integration

Fetch available mini-apps from the Slinks directory:

```jsx
import { Trigger } from '@sherrylinks/slinks';
import { useState, useEffect } from 'react';

function DirectoryTriggers({ adapter }) {
  const [miniApps, setMiniApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMiniApps = async () => {
      try {
        const response = await fetch('https://api.sherry.social/v1/directory/v1');
        const data = await response.json();
        setMiniApps(data.mini_apps);
      } catch (error) {
        console.error('Error fetching mini-apps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMiniApps();
  }, []);

  if (loading) return <div>Loading mini-apps...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {miniApps
        .filter(app => app.state === 'trusted') // Only show trusted apps
        .map((app) => (
          <Trigger
            key={app.id}
            url={`${app.host}${app.path}`}
            adapter={adapter}
            enableAnalytics={true}
          />
        ))}
    </div>
  );
}
```

### Method 3: Metadata Object Integration

Define mini-apps using metadata objects:

```jsx
import { Trigger, createMetadata } from '@sherrylinks/slinks';

function MetadataTrigger({ adapter }) {
  const miniappMetadata = {
    url: 'https://example.com',
    icon: 'https://example.com/icon.png',
    title: 'My Mini App',
    description: 'A sample blockchain mini-app',
    baseUrl: 'https://api.example.com',
    actions: [
      {
        type: 'transfer',
        label: 'Send 0.01 ETH',
        to: '0x742d35Cc6634C0532925a3b8D000b7AA5b7eA48C',
        amount: 0.01,
        chains: {
          source: 1, // Ethereum mainnet
        },
      },
    ],
  };

  const validatedMetadata = createMetadata(miniappMetadata);

  return (
    <Trigger
      metadata={validatedMetadata}
      adapter={adapter}
      securityState="unknown"
    />
  );
}
```

### Directory API Response Structure

The directory API returns a structured response with available mini-apps:

```json
{
  "lastUpdated": "2025-07-11T17:39:19.431Z",
  "version": "1.0.0",
  "mini_apps": [
    {
      "id": "e2349bf1-0893-44cd-a5aa-0f8104b7094d",
      "host": "https://api.sherry.social",
      "state": "trusted",
      "category": "Sherry KOL",
      "subcategory": "Swap",
      "verifiedAt": "2025-07-11T15:51:49.610392",
      "protocol": "Protocol",
      "path": "/v1/miniapp/e2349bf1-0893-44cd-a5aa-0f8104b7094d/metadata",
      "source": "chat"
    }
  ],
  "templates": [...],
  "maliciousDomains": [...]
}
```

To use a mini-app from the directory, combine `host + path` and pass it to the Trigger component:

```jsx
const miniAppUrl = `${miniApp.host}${miniApp.path}`;
<Trigger url={miniAppUrl} adapter={adapter} />
```

### Style Presets

**⚠️ Under Development** - Custom styling options are currently under development and will be available in a future release.

```jsx
<Trigger
  url="https://example.com/api/miniapp"
  adapter={adapter}
  // stylePreset="dark" // Coming soon - will support "dark", "light", "auto"
/>
```

### Security States

**⚠️ Under Development** - Security state customization is currently under development and will be available in a future release.

```jsx
<Trigger
  metadata={validatedMetadata}
  adapter={adapter}
  // securityState="verified" // Coming soon - will support "unknown", "malicious", "verified"
/>
```

### Analytics

**📊 Always Enabled** - Analytics are automatically collected for all integrations. The `enableAnalytics` option will be deprecated in future versions as analytics collection will always be active.

```jsx
<Trigger
  url="https://example.com/api/miniapp"
  adapter={adapter}
  enableAnalytics={true} // Always collected - this option will be deprecated
/>
```

## Complete Example

Here's a complete working example:

```jsx
import React from 'react';
import { Trigger, createWagmiAdapter } from '@sherrylinks/slinks';
import { useConfig } from 'wagmi';
import '@sherrylinks/slinks/index.css';

function MiniAppContainer() {
  const config = useConfig();
  const adapter = createWagmiAdapter(config);

  const miniapps = [
    'https://api.sherry.social/v1/miniapp/example-1/metadata',
    'https://api.sherry.social/v1/miniapp/example-2/metadata',
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      padding: '20px'
    }}>
      {miniapps.map((url, index) => (
        <Trigger
          key={index}
          url={url}
          adapter={adapter}
          enableAnalytics={true} // Always collected - will be deprecated
          // stylePreset="auto" // Coming soon
        />
      ))}
    </div>
  );
}

export default MiniAppContainer;
```

## Error Handling

The Trigger component handles errors gracefully:

- Invalid URLs show error states
- Malicious apps are blocked
- Network errors are displayed to users
- Failed transactions can be retried

## Best Practices

1. **Always validate metadata** before passing to Trigger
2. **Use proper error boundaries** around Trigger components
3. **Test with different networks** and wallet states
4. **Implement proper loading states** for better UX
5. **Cache metadata** when possible to improve performance

## API Reference

### Trigger Props

```typescript
export type TriggerProps = {
  adapter: SherryAdapter;
  stylePreset?: StylePreset; // ⚠️ Under Development
  enableAnalytics?: boolean; // 📊 Always collected - will be deprecated
  player?: boolean;
} & (
  | {
      url: string;
      metadata?: never;
      securityState?: never;
    }
  | {
      metadata: ValidatedMetadata;
      securityState: TriggerSecurityState; // ⚠️ Under Development
      url?: string;
    }
);
```

### SherryAdapter Interface

The adapter interface provides wallet connectivity:

```typescript
interface SherryAdapter {
  connect(): Promise<string>;
  sendTransaction(params: TransactionParams): Promise<{hash: string}>;
  signMessage(message: string): Promise<string>;
  switchChain(chainId: number): Promise<void>;
  getAddress(): Promise<string>;
  getChainId(): Promise<number>;
  isConnected(): Promise<boolean>;
}
```

## Troubleshooting

### Common Issues

1. **Wallet not connected**: Ensure your wagmi config is properly set up
2. **Metadata validation errors**: Check your metadata format
3. **Network issues**: Verify your RPC endpoints
4. **Style conflicts**: Import the CSS file correctly

### Using the Directory API

The Slinks directory API provides a curated list of available mini-apps. You can fetch and filter these apps based on your needs:

```jsx
// Fetch all trusted mini-apps
const response = await fetch('https://api.sherry.social/v1/directory/v1');
const directory = await response.json();

// Filter by category
const swapApps = directory.mini_apps.filter(app => 
  app.state === 'trusted' && app.subcategory === 'Swap'
);

// Filter by protocol
const protocolApps = directory.mini_apps.filter(app => 
  app.protocol === 'Protocol'
);
```

## Support

For additional support and examples, visit:

- [Slinks Documentation](https://docs.sherry.social)
