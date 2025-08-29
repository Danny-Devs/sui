// VUI Kit - Vue 3 Sui dApp Kit
// Main entry point

// Providers
export { VuiProvider } from './providers/VuiProvider'
export { WalletProvider } from './providers/WalletProvider'

// Core Composables
export { useSuiClient } from './composables/useSuiClient'
export { useCurrentWallet } from './composables/useCurrentWallet'
export { useCurrentAccount } from './composables/useCurrentAccount'
export { useWallets } from './composables/useWallets'
export { useConnectWallet } from './composables/useConnectWallet'
export { useDisconnectWallet } from './composables/useDisconnectWallet'

// Query Composables
export { useBalance } from './composables/useBalance'
export { useOwnedObjects } from './composables/useOwnedObjects'
export { useTransactionBlock } from './composables/useTransactionBlock'
export { useSuiClientQuery } from './composables/useSuiClientQuery'

// Transaction Composables
export { useSignAndExecuteTransaction } from './composables/useSignAndExecuteTransaction'
export { useSignPersonalMessage } from './composables/useSignPersonalMessage'
export { useSignTransaction } from './composables/useSignTransaction'

// Components
export { default as ConnectButton } from './components/ConnectButton.vue'
export { default as WalletButton } from './components/WalletButton.vue'
export { default as AccountDropdown } from './components/AccountDropdown.vue'

// Stores
export { useWalletStore } from './stores/walletStore'
export { useAppStore } from './stores/appStore'

// Types
export type * from './types'

// Utils
export * from './utils'
