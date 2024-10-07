import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'

// const rpcEndpoint = process.env.RPC_ENDPOINT  || "";
// const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const hardhatConfig: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    // currentNetwork: {
    //   url: rpcEndpoint,
    //   accounts: [PRIVATE_KEY],
    // },
  },
};

export default hardhatConfig;
