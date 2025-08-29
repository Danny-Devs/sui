# VUI Kit - Vue 3 Sui dApp Kit

🚀 **VUI (V-U-I) Kit** - The ultimate Vue 3 library for building Sui blockchain applications.

## Features

- 🎯 **Complete Feature Parity** with React dApp Kit
- ⚡ **Vue 3 Optimized** - Composition API, reactivity, TypeScript
- 🔄 **Pinia Integration** - Reactive wallet and app state management
- 🌊 **TanStack Vue Query** - Powerful blockchain data fetching
- 🎨 **Headless Components** - Bring your own styling
- 🛠️ **Developer Experience** - Full TypeScript support, great DevTools

## Quick Start

```bash
pnpm add @mysten/vui-kit @tanstack/vue-query pinia
```

```vue
<template>
  <div>
    <VuiProvider>
      <WalletProvider>
        <ConnectButton />
        <YourApp />
      </WalletProvider>
    </VuiProvider>
  </div>
</template>

<script setup lang="ts">
import { VuiProvider, WalletProvider, ConnectButton } from '@mysten/vui-kit'
</script>
```

## Composables

```typescript
// Wallet Management
const { currentWallet, connect, disconnect } = useCurrentWallet();
const { currentAccount } = useCurrentAccount();
const { wallets } = useWallets();

// Blockchain Queries
const { data: balance } = useBalance({ address });
const { data: objects } = useOwnedObjects({ owner });
const { data: txn } = useTransactionBlock({ digest });

// Transactions
const { mutate: signAndExecute } = useSignAndExecuteTransaction();
const { mutate: signMessage } = useSignPersonalMessage();
```

## Architecture

- **Composables** - Vue 3 reactive blockchain interactions
- **Components** - Headless, accessible UI components
- **Stores** - Pinia-powered state management
- **Providers** - Vue plugins for easy setup
- **Types** - Full TypeScript support

Built with ❤️ for the Vue + Sui ecosystem.
