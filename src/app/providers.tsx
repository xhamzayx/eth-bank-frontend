"use client";

import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  RainbowKitProvider,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "ETH Bank",
  projectId: "d22557e2cc33253d5f8c1b05448e0a93",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
