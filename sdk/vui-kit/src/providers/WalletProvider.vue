<template>
	<div>
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useWalletStore } from '../stores/walletStore'
import { getWallets } from '@mysten/wallet-standard'
import type { VuiWallet } from '../types'

interface Props {
	autoConnect?: boolean
	requiredFeatures?: string[]
}

const props = withDefaults(defineProps<Props>(), {
	autoConnect: true,
	requiredFeatures: () => ['sui:connect', 'sui:signTransaction']
})

const walletStore = useWalletStore()

// Wallet discovery and setup
onMounted(async () => {
	try {
		// Get available wallets
		const standardWallets = getWallets()
		
		// Convert to VUI wallet format
		const vuiWallets: VuiWallet[] = standardWallets.get().map(wallet => ({
			name: wallet.name,
			icon: wallet.icon,
			accounts: wallet.accounts,
			features: wallet.features,
			connect: async () => {
				await wallet.features['sui:connect'].connect()
			},
			disconnect: async () => {
				if (wallet.features['sui:disconnect']) {
					await wallet.features['sui:disconnect'].disconnect()
				}
			}
		}))
		
		walletStore.setWallets(vuiWallets)
		
		// Auto-connect to previously connected wallet
		if (props.autoConnect) {
			const lastConnectedWallet = localStorage.getItem('vui-last-wallet')
			if (lastConnectedWallet) {
				const wallet = vuiWallets.find(w => w.name === lastConnectedWallet)
				if (wallet) {
					try {
						await walletStore.connectWallet(wallet)
					} catch (error) {
						console.warn('Failed to auto-connect to last wallet:', error)
						localStorage.removeItem('vui-last-wallet')
					}
				}
			}
		}
		
		// Listen for wallet changes
		const unsubscribe = standardWallets.on('register', () => {
			// Refresh wallet list when new wallets are registered
			const updatedWallets = standardWallets.get().map(wallet => ({
				name: wallet.name,
				icon: wallet.icon,
				accounts: wallet.accounts,
				features: wallet.features,
				connect: async () => {
					await wallet.features['sui:connect'].connect()
				},
				disconnect: async () => {
					if (wallet.features['sui:disconnect']) {
						await wallet.features['sui:disconnect'].disconnect()
					}
				}
			}))
			walletStore.setWallets(updatedWallets)
		})
		
		// Store unsubscribe function for cleanup
		;(window as any).__vui_wallet_unsubscribe = unsubscribe
		
	} catch (error) {
		console.error('Failed to initialize wallets:', error)
		walletStore.setConnectionError(error as Error)
	}
})

// Cleanup
onUnmounted(() => {
	const unsubscribe = (window as any).__vui_wallet_unsubscribe
	if (unsubscribe) {
		unsubscribe()
		delete (window as any).__vui_wallet_unsubscribe
	}
})
</script>
