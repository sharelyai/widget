const ENVIRONMENT = {
  DEVELOPMENT: {
    key: "DEV",
    status: "PUBLISHED",
  },
  STAGING: {
    key: "STAGING",
    status: "PUBLISHED_UAT",
  },
  PRODUCTION: {
    key: "PROD",
    status: "PUBLISHED",
  },
  UAT: {
    key: "UAT",
    status: "PUBLISHED_UAT",
  },
};

let globalEnv: string | null = null;

export const setGlobalEnv = (env: string | null) => {
  globalEnv = env;
};

export const getGlobalEnv = (): string | null => {
  return globalEnv;
};

export const getGlobalEnvStatus = (): string | null => {
  return (
    Object.values(ENVIRONMENT).find((env) => env.key === globalEnv)?.status ||
    null
  );
};

export const getGlobalEnvHeaders = (): Record<string, string> => {
  const status = getGlobalEnvStatus();
  if (status) {
    return { "x-sharely-environment": status };
  }
  return {};
};
