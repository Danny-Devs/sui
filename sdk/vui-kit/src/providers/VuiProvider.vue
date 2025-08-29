<template>
	<div>
		<slot />
	</div>
</template>

<script setup lang="ts">
import { provide, onMounted } from 'vue'
import { createPinia } from 'pinia'
import { useAppStore } from '../stores/appStore'
import type { VuiConfig } from '../types'
import { getFullnodeUrl } from '@mysten/sui/client'

interface Props {
	config?: VuiConfig
	networks?: Record<string, { url: string }>
	defaultNetwork?: string
	autoConnect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	defaultNetwork: 'mainnet',
	autoConnect: true,
	networks: () => ({
		mainnet: { url: getFullnodeUrl('mainnet') },
		testnet: { url: getFullnodeUrl('testnet') },
		devnet: { url: getFullnodeUrl('devnet') },
		localnet: { url: getFullnodeUrl('localnet') }
	})
})

// Create pinia instance
const pinia = createPinia()

// Initialize app store
onMounted(() => {
	const appStore = useAppStore()
	
	const vuiConfig: VuiConfig = props.config || {
		networks: props.networks,
		defaultNetwork: props.defaultNetwork,
		autoConnect: props.autoConnect
	}
	
	appStore.initialize(vuiConfig)
})

// Provide pinia instance
provide('pinia', pinia)
</script>
