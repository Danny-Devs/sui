// VUI Kit - useSuiClient composable
import type { SuiClient } from '@mysten/sui/client';
import { computed } from 'vue';

import { useAppStore } from '../stores/appStore';

/**
 * Access the current Sui client instance
 * @returns Reactive reference to SuiClient
 */
export function useSuiClient() {
	const appStore = useAppStore();

	const client = computed<SuiClient | null>(() => appStore.client);
	const network = computed(() => appStore.currentNetwork);
	const isConnected = computed(() => appStore.client !== null);

	const switchNetwork = (networkName: string) => {
		appStore.setNetwork(networkName);
	};

	return {
		client,
		network,
		isConnected,
		switchNetwork,
	};
}
