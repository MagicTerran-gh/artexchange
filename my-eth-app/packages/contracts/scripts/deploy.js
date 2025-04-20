const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署合约的账户:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());

  // 部署ArtToken
  const ArtToken = await hre.ethers.getContractFactory("ArtToken");
  const artToken = await ArtToken.deploy();
  await artToken.deployed();
  console.log("ArtToken部署地址:", artToken.address);

  // 部署ArtNFT
  const ArtNFT = await hre.ethers.getContractFactory("ArtNFT");
  const artNFT = await ArtNFT.deploy();
  await artNFT.deployed();
  console.log("ArtNFT部署地址:", artNFT.address);

  // 部署ArtMarketplace
  const ArtMarketplace = await hre.ethers.getContractFactory("ArtMarketplace");
  const artMarketplace = await ArtMarketplace.deploy(artToken.address);
  await artMarketplace.deployed();
  console.log("ArtMarketplace部署地址:", artMarketplace.address);

  // 设置ArtNFT的市场地址
  await artNFT.setMarketplaceAddress(artMarketplace.address);
  console.log("已设置ArtNFT的市场地址");

  // 为测试账户铸造一些代币
  const mintAmount = hre.ethers.utils.parseEther("10000");
  await artToken.mint(deployer.address, mintAmount);
  console.log(`已为${deployer.address}铸造10000个ACT代币`);

  console.log("合约部署完成！");
  console.log("ArtToken:", artToken.address);
  console.log("ArtNFT:", artNFT.address);
  console.log("ArtMarketplace:", artMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });