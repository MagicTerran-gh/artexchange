require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: 'd:/1dapp/my-eth-app/.env' });

// 检查环境变量是否存在
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

console.log("PRIVATE_KEY 长度:", PRIVATE_KEY.length);
console.log("INFURA_PROJECT_ID 是否存在:", !!INFURA_PROJECT_ID);
console.log("INFURA_PROJECT_ID:", INFURA_PROJECT_ID);

module.exports = {
  solidity: "0.8.4",
  paths: {
    sources: "./src/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      // 增加超时时间（毫秒）
      timeout: 60000,
      // 增加确认区块数
      confirmations: 2,
    },
    // 添加备用网络
    sepoliaAlchemy: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      timeout: 60000,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};