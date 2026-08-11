declare module 'expo-network' {
  export interface NetworkState {
    type?: string;
    isConnected?: boolean;
    isInternetReachable?: boolean;
  }

  export function getNetworkStateAsync(): Promise<NetworkState>;
  export function getIpAddressAsync(): Promise<string>;
  export function getMacAddressAsync(interfaceName?: string | null): Promise<string>;
  export function isAirplaneModeEnabledAsync(): Promise<boolean>;
}
