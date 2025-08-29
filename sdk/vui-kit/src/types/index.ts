// VUI Kit Types
import type { WalletAccount } from '@mysten/wallet-standard'
import type { SuiClient } from '@mysten/sui/client'

// Wallet Types
export interface VuiWallet {
	name: string
	icon?: string
	accounts: readonly WalletAccount[]
	features: Record<string, unknown>
	connect(): Promise<void>
	disconnect(): Promise<void>
}

// Network Configuration
export interface NetworkConfig {
	name: string
	url: string
	chainId?: string
}

export interface VuiConfig {
	networks: Record<string, NetworkConfig>
	defaultNetwork: string
	autoConnect?: boolean
	theme?: 'light' | 'dark' | 'auto'
}

// Component Props
export interface ConnectButtonProps {
	size?: 'sm' | 'md' | 'lg'
	variant?: 'primary' | 'secondary' | 'outline'
	disabled?: boolean
	connectText?: string
	connectedText?: string
}

export interface WalletButtonProps extends ConnectButtonProps {
	showBalance?: boolean
	showAccount?: boolean
}

// Query Types
export interface QueryOptions {
	enabled?: boolean
	refetchInterval?: number
	staleTime?: number
	cacheTime?: number
}

export interface BalanceQuery {
	address: string
	coinType?: string
}

export interface OwnedObjectsQuery {
	owner: string
	cursor?: string | null
	limit?: number
	filter?: {
		StructType?: string
		AddressOwner?: string
		ObjectOwner?: string
		Package?: string
		Module?: string
	}
	options?: {
		showType?: boolean
		showOwner?: boolean
		showPreviousTransaction?: boolean
		showDisplay?: boolean
		showContent?: boolean
		showBcs?: boolean
		showStorageRebate?: boolean
	}
}

// Transaction Types
export interface TransactionOptions {
	onSuccess?: (result: any) => void
	onError?: (error: Error) => void
	onSettled?: () => void
}

// Store State Types
export interface WalletState {
	currentWallet: VuiWallet | null
	currentAccount: WalletAccount | null
	wallets: VuiWallet[]
	isConnecting: boolean
	isConnected: boolean
	connectionError: Error | null
}

export interface AppState {
	currentNetwork: string
	client: SuiClient | null
	isLoading: boolean
	error: Error | null
}
