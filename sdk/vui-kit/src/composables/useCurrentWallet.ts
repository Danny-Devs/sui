// VUI Kit - useCurrentWallet composable
import { computed } from 'vue';

import { useWalletStore } from '../stores/walletStore';
import type { VuiWallet } from '../types';

/**
 * Access and manage the current wallet connection
 * @returns Current wallet state and connection methods
 */
export function useCurrentWallet() {
	const walletStore = useWalletStore();

	const currentWallet = computed<VuiWallet | null>(() => walletStore.currentWallet);
	const isConnected = computed(() => walletStore.isConnected);
	const isConnecting = computed(() => walletStore.isConnecting);
	const connectionError = computed(() => walletStore.connectionError);

	const connect = async (wallet: VuiWallet) => {
		try {
			await walletStore.connectWallet(wallet);
			// Save for auto-connect
			localStorage.setItem('vui-last-wallet', wallet.name);
		} catch (error) {
			throw error;
		}
	};

	const disconnect = async () => {
		await walletStore.disconnectWallet();
		// Clear auto-connect
		localStorage.removeItem('vui-last-wallet');
	};

	return {
		currentWallet,
		isConnected,
		isConnecting,
		connectionError,
		connect,
		disconnect,
	};
}
