const fs = require('fs');
const path = require('path');

// 修正源目录路径
const artifactsDir = path.join(__dirname, '../artifacts/src/contracts');
const abiDir = path.join(__dirname, '../src/abis');

// 确保目标目录存在
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

// 要复制的合约名称
const contracts = ['ArtToken', 'ArtNFT', 'ArtMarketplace'];

contracts.forEach(contractName => {
  // 源文件路径
  const sourcePath = path.join(artifactsDir, `${contractName}.sol/${contractName}.json`);
  
  // 目标文件路径
  const destPath = path.join(abiDir, `${contractName}.json`);
  
  try {
    // 读取合约 JSON 文件
    const contractJson = require(sourcePath);
    
    // 提取 ABI
    const abi = contractJson.abi;
    
    // 写入 ABI 到目标文件
    fs.writeFileSync(destPath, JSON.stringify(abi, null, 2));
    
    console.log(`已复制 ${contractName} ABI 到 ${destPath}`);
  } catch (error) {
    console.error(`复制 ${contractName} ABI 失败:`, error);
  }
});

console.log('ABI 复制完成');