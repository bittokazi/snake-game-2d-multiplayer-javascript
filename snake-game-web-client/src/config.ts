const devConfig = {
  API_BASE_URL: "http://192.168.10.100:3001",
};

const prodConfig = {
  API_BASE_URL: "/",
};

let selectedConf = devConfig;

if (process.env.DEPLOY_ENV === "prod") {
  selectedConf = prodConfig;
}

export const Config = selectedConf;
