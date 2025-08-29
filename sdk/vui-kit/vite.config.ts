import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'VuiKit',
			fileName: 'index',
		},
		rollupOptions: {
			external: ['vue', '@tanstack/vue-query', '@mysten/sui', '@mysten/wallet-standard'],
			output: {
				globals: {
					vue: 'Vue',
					'@tanstack/vue-query': 'VueQuery',
					'@mysten/sui': 'SuiSDK',
					'@mysten/wallet-standard': 'WalletStandard',
				},
			},
		},
	},
	test: {
		environment: 'jsdom',
	},
});
