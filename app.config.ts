import { ExpoConfig, ConfigContext } from '@expo/config';

const appEnv = (process.env.APP_ENV ?? 'dev') as 'dev' | 'staging' | 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: {
    ...((config.extra ?? {}) as Record<string, unknown>),
    appEnv,
  },
});
