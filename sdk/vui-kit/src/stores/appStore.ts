// VUI Kit - App Store (Pinia)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import type { AppState, NetworkConfig, VuiConfig } from '../types'

export const useAppStore = defineStore('vui-app', () => {
	// State
	const config = ref<VuiConfig | null>(null)
	const currentNetwork = ref<string>('mainnet')
	const client = ref<SuiClient | null>(null)
	const isLoading = ref(false)
	const error = ref<Error | null>(null)

	// Getters
	const isInitialized = computed(() => {
		return config.value !== null && client.value !== null
	})

	const networkConfig = computed((): NetworkConfig | null => {
		if (!config.value) return null
		return config.value.networks[currentNetwork.value] || null
	})

	const availableNetworks = computed((): NetworkConfig[] => {
		if (!config.value) return []
		return Object.values(config.value.networks)
	})

	// Actions
	const initialize = (vuiConfig: VuiConfig) => {
		config.value = vuiConfig
		setNetwork(vuiConfig.defaultNetwork)
	}

	const setNetwork = (networkName: string) => {
		if (!config.value) {
			throw new Error('VUI not initialized. Call initialize() first.')
		}

		const network = config.value.networks[networkName]
		if (!network) {
			throw new Error(`Network '${networkName}' not found in configuration`)
		}

		currentNetwork.value = networkName
		
		// Create new client instance
		client.value = new SuiClient({
			url: network.url
		})
	}

	const setLoading = (loading: boolean) => {
		isLoading.value = loading
		if (loading) {
			error.value = null
		}
	}

	const setError = (err: Error | null) => {
		error.value = err
		isLoading.value = false
	}

	const reset = () => {
		config.value = null
		currentNetwork.value = 'mainnet'
		client.value = null
		isLoading.value = false
		error.value = null
	}

	return {
		// State
		config: readonly(config),
		currentNetwork: readonly(currentNetwork),
		client: readonly(client),
		isLoading: readonly(isLoading),
		error: readonly(error),
		
		// Getters
		isInitialized,
		networkConfig,
		availableNetworks,
		
		// Actions
		initialize,
		setNetwork,
		setLoading,
		setError,
		reset
	}
})
