// App configuration
// All configuration comes from environment variables

const getAppConfig = () => {
	return {
		// Supabase configuration
		supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
		supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
		
		// Admin configuration
		adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
		adminName: import.meta.env.VITE_ADMIN_NAME || 'Admin',
		
		// Platform configuration
		appName: 'Brokerr',
		appVersion: '1.0.0',
		environment: import.meta.env.MODE || 'development',
		isDevelopment: import.meta.env.MODE === 'development',
		isProduction: import.meta.env.MODE === 'production',
		
		// API configuration
		apiUrl: import.meta.env.VITE_API_URL || window.location.origin,
		
		// Feature flags
		enableCopyTrading: true,
		enableMultiChain: true,
		maxDepositAmount: 1000000,
		maxWithdrawalAmount: 1000000,
	};
};

export const appParams = getAppConfig();
