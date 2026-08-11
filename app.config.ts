import { ExpoConfig, ConfigContext } from '@expo/config';

const appEnv = (process.env.APP_ENV ?? 'dev') as 'dev' | 'staging' | 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    appEnv,
  },
});
