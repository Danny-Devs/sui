// VUI Kit - useCurrentAccount composable
import type { WalletAccount } from '@mysten/wallet-standard';
import { computed } from 'vue';

import { useWalletStore } from '../stores/walletStore';

/**
 * Access and manage the current wallet account
 * @returns Current account state and switching methods
 */
export function useCurrentAccount() {
	const walletStore = useWalletStore();

	const currentAccount = computed<WalletAccount | null>(() => walletStore.currentAccount);
	const address = computed(() => walletStore.connectedAccountAddress);
	const isConnected = computed(() => walletStore.isConnected);

	const switchAccount = (account: WalletAccount) => {
		walletStore.switchAccount(account);
	};

	const availableAccounts = computed(() => {
		return walletStore.currentWallet?.accounts || [];
	});

	return {
		currentAccount,
		address,
		isConnected,
		switchAccount,
		availableAccounts,
	};
}
