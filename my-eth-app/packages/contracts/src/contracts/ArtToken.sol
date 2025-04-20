// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtToken is ERC20, Ownable {
    constructor() ERC20("Art Collection Token", "ACT") {
        // 初始铸造1,000,000代币给部署者
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    // 允许平台铸造更多代币（用于测试或奖励）
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}