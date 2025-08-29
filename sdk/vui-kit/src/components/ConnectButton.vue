<template>
	<button
		:class="buttonClasses"
		:disabled="isConnecting || disabled"
		@click="handleClick"
	>
		<span v-if="isConnecting" class="vui-spinner"></span>
		<span v-else>{{ buttonText }}</span>
	</button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCurrentWallet } from '../composables/useCurrentWallet'
import { useWallets } from '../composables/useWallets'
import type { ConnectButtonProps } from '../types'

interface Props extends ConnectButtonProps {
	size?: 'sm' | 'md' | 'lg'
	variant?: 'primary' | 'secondary' | 'outline'
	disabled?: boolean
	connectText?: string
	connectedText?: string
}

const props = withDefaults(defineProps<Props>(), {
	size: 'md',
	variant: 'primary',
	disabled: false,
	connectText: 'Connect Wallet',
	connectedText: 'Connected'
})

const emit = defineEmits<{
	connect: [wallet: any]
	disconnect: []
	error: [error: Error]
}>()

const { isConnected, isConnecting, currentWallet, connect, disconnect } = useCurrentWallet()
const { wallets } = useWallets()

const showWalletSelector = ref(false)

const buttonText = computed(() => {
	if (isConnected.value) {
		return props.connectedText
	}
	return props.connectText
})

const buttonClasses = computed(() => {
	const baseClasses = 'vui-button'
	const sizeClasses = {
		sm: 'vui-button--sm',
		md: 'vui-button--md',
		lg: 'vui-button--lg'
	}
	const variantClasses = {
		primary: 'vui-button--primary',
		secondary: 'vui-button--secondary',
		outline: 'vui-button--outline'
	}
	
	return [
		baseClasses,
		sizeClasses[props.size],
		variantClasses[props.variant],
		{
			'vui-button--disabled': props.disabled || isConnecting.value,
			'vui-button--connected': isConnected.value
		}
	]
})

const handleClick = async () => {
	if (isConnected.value) {
		try {
			await disconnect()
			emit('disconnect')
		} catch (error) {
			emit('error', error as Error)
		}
	} else {
		// If only one wallet, connect directly
		if (wallets.value.length === 1) {
			try {
				await connect(wallets.value[0])
				emit('connect', wallets.value[0])
			} catch (error) {
				emit('error', error as Error)
			}
		} else {
			// Show wallet selector (simplified for now)
			showWalletSelector.value = true
		}
	}
}

const selectWallet = async (wallet: any) => {
	try {
		await connect(wallet)
		emit('connect', wallet)
		showWalletSelector.value = false
	} catch (error) {
		emit('error', error as Error)
	}
}
</script>

<style scoped>
.vui-button {
	@apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors;
}

.vui-button--sm {
	@apply px-3 py-1.5 text-xs;
}

.vui-button--md {
	@apply px-4 py-2 text-sm;
}

.vui-button--lg {
	@apply px-6 py-3 text-base;
}

.vui-button--primary {
	@apply text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500;
}

.vui-button--secondary {
	@apply text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500;
}

.vui-button--outline {
	@apply text-blue-600 bg-white border-blue-600 hover:bg-blue-50 focus:ring-blue-500;
}

.vui-button--disabled {
	@apply opacity-50 cursor-not-allowed;
}

.vui-button--connected {
	@apply bg-green-600 hover:bg-green-700;
}

.vui-spinner {
	@apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}
</style>
