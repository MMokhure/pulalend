import { NextConfig } from 'next';

const nextConfig: NextConfig = {
	eslint: { ignoreDuringBuilds: true },
	experimental: {
		workerThreads: false,
		cpus: 1,
	},
};

export default nextConfig;

