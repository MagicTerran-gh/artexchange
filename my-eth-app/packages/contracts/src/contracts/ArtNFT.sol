// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // 艺术品市场合约地址
    address public marketplaceAddress;
    
    // 铸造事件
    event ArtworkMinted(uint256 tokenId, address creator, string tokenURI);
    
    constructor() ERC721("ArtCollection", "ARTC") {}
    
    // 设置市场合约地址
    function setMarketplaceAddress(address _marketplaceAddress) external onlyOwner {
        marketplaceAddress = _marketplaceAddress;
    }
    
    // 铸造新的艺术品NFT
    function mintArtwork(string memory _tokenURI) external returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        
        // 自动授权市场合约操作此NFT
        if (marketplaceAddress != address(0)) {
            setApprovalForAll(marketplaceAddress, true);
        }
        
        emit ArtworkMinted(newTokenId, msg.sender, _tokenURI);
        
        return newTokenId;
    }
}