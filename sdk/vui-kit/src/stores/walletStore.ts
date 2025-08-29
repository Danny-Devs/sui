// VUI Kit - Wallet Store (Pinia)
import type { WalletAccount } from '@mysten/wallet-standard';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { VuiWallet, WalletState } from '../types';

export const useWalletStore = defineStore('vui-wallet', () => {
	// State
	const currentWallet = ref<VuiWallet | null>(null);
	const currentAccount = ref<WalletAccount | null>(null);
	const wallets = ref<VuiWallet[]>([]);
	const isConnecting = ref(false);
	const connectionError = ref<Error | null>(null);

	// Getters
	const isConnected = computed(() => {
		return currentWallet.value !== null && currentAccount.value !== null;
	});

	const hasWallets = computed(() => {
		return wallets.value.length > 0;
	});

	const connectedAccountAddress = computed(() => {
		return currentAccount.value?.address || null;
	});

	// Actions
	const setWallets = (newWallets: VuiWallet[]) => {
		wallets.value = newWallets;
	};

	const setCurrentWallet = (wallet: VuiWallet | null) => {
		currentWallet.value = wallet;
		if (!wallet) {
			currentAccount.value = null;
		}
	};

	const setCurrentAccount = (account: WalletAccount | null) => {
		currentAccount.value = account;
	};

	const setConnecting = (connecting: boolean) => {
		isConnecting.value = connecting;
		if (connecting) {
			connectionError.value = null;
		}
	};

	const setConnectionError = (error: Error | null) => {
		connectionError.value = error;
		isConnecting.value = false;
	};

	const connectWallet = async (wallet: VuiWallet) => {
		try {
			setConnecting(true);
			await wallet.connect();
			setCurrentWallet(wallet);

			// Set the first account as current
			if (wallet.accounts.length > 0) {
				setCurrentAccount(wallet.accounts[0]);
			}

			setConnecting(false);
		} catch (error) {
			setConnectionError(error as Error);
			throw error;
		}
	};

	const disconnectWallet = async () => {
		if (!currentWallet.value) return;

		try {
			await currentWallet.value.disconnect();
		} catch (error) {
			console.error('Error disconnecting wallet:', error);
		} finally {
			setCurrentWallet(null);
			setCurrentAccount(null);
		}
	};

	const switchAccount = (account: WalletAccount) => {
		if (!currentWallet.value?.accounts.includes(account)) {
			throw new Error('Account not found in current wallet');
		}
		setCurrentAccount(account);
	};

	const reset = () => {
		setCurrentWallet(null);
		setCurrentAccount(null);
		setWallets([]);
		setConnecting(false);
		setConnectionError(null);
	};

	return {
		// State
		currentWallet: readonly(currentWallet),
		currentAccount: readonly(currentAccount),
		wallets: readonly(wallets),
		isConnecting: readonly(isConnecting),
		connectionError: readonly(connectionError),

		// Getters
		isConnected,
		hasWallets,
		connectedAccountAddress,

		// Actions
		setWallets,
		setCurrentWallet,
		setCurrentAccount,
		setConnecting,
		setConnectionError,
		connectWallet,
		disconnectWallet,
		switchAccount,
		reset,
	};
});
