// VUI Kit - useWallets composable
import { computed } from 'vue';

import { useWalletStore } from '../stores/walletStore';
import type { VuiWallet } from '../types';

/**
 * Access all available wallets
 * @returns Available wallets and connection utilities
 */
export function useWallets() {
	const walletStore = useWalletStore();

	const wallets = computed<VuiWallet[]>(() => walletStore.wallets);
	const hasWallets = computed(() => walletStore.hasWallets);
	const isConnecting = computed(() => walletStore.isConnecting);

	const connectWallet = async (wallet: VuiWallet) => {
		await walletStore.connectWallet(wallet);
		localStorage.setItem('vui-last-wallet', wallet.name);
	};

	const findWallet = (name: string) => {
		return wallets.value.find((wallet) => wallet.name === name) || null;
	};

	return {
		wallets,
		hasWallets,
		isConnecting,
		connectWallet,
		findWallet,
	};
}
