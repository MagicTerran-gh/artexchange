// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ArtMarketplace is Ownable, ReentrancyGuard {
    // 手续费率（2.5%）
    uint256 public feePercent = 25;
    uint256 public constant PERCENT_DIVIDER = 1000;
    
    // 支付代币地址
    address public paymentToken;
    
    // 用户结构
    struct User {
        string username;
        string profileImage;
        string bio;
        bool isRegistered;
    }
    
    // 艺术品结构
    struct Artwork {
        uint256 id;
        address creator;
        string title;
        string description;
        string imageURI;
        bool isForSale;
        uint256 price;
        address nftContract;
        uint256 tokenId;
        bool exists;
    }
    
    // 用户地址 => 用户信息
    mapping(address => User) public users;
    
    // 艺术品ID => 艺术品信息
    mapping(uint256 => Artwork) public artworks;
    uint256 public artworkCount;
    
    // 用户地址 => 艺术品ID数组
    mapping(address => uint256[]) public userArtworks;
    
    // 事件
    event UserRegistered(address user, string username);
    event UserUpdated(address user, string username);
    event ArtworkCreated(
        uint256 id,
        address creator,
        string title,
        string imageURI,
        bool isForSale,
        uint256 price
    );
    event ArtworkUpdated(
        uint256 id,
        string title,
        string description,
        bool isForSale,
        uint256 price
    );
    event ArtworkSold(
        uint256 id,
        address seller,
        address buyer,
        uint256 price,
        uint256 fee
    );
    
    constructor(address _paymentToken) {
        paymentToken = _paymentToken;
    }
    
    // 注册用户
    function registerUser(string memory _username, string memory _profileImage, string memory _bio) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        users[msg.sender] = User({
            username: _username,
            profileImage: _profileImage,
            bio: _bio,
            isRegistered: true
        });
        
        emit UserRegistered(msg.sender, _username);
    }
    
    // 更新用户信息
    function updateUserProfile(string memory _username, string memory _profileImage, string memory _bio) external {
        require(users[msg.sender].isRegistered, "User not registered");
        
        User storage user = users[msg.sender];
        user.username = _username;
        user.profileImage = _profileImage;
        user.bio = _bio;
        
        emit UserUpdated(msg.sender, _username);
    }
    
    // 创建艺术品（上传自己的艺术品）
    function createArtwork(
        string memory _title,
        string memory _description,
        string memory _imageURI,
        bool _isForSale,
        uint256 _price,
        address _nftContract,
        uint256 _tokenId
    ) external {
        require(users[msg.sender].isRegistered, "User not registered");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_imageURI).length > 0, "Image URI cannot be empty");
        
        // 验证调用者是NFT的所有者
        if (_nftContract != address(0)) {
            require(IERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "Not the owner of NFT");
        }
        
        artworkCount++;
        
        Artwork memory newArtwork = Artwork({
            id: artworkCount,
            creator: msg.sender,
            title: _title,
            description: _description,
            imageURI: _imageURI,
            isForSale: _isForSale,
            price: _price,
            nftContract: _nftContract,
            tokenId: _tokenId,
            exists: true
        });
        
        artworks[artworkCount] = newArtwork;
        userArtworks[msg.sender].push(artworkCount);
        
        emit ArtworkCreated(
            artworkCount,
            msg.sender,
            _title,
            _imageURI,
            _isForSale,
            _price
        );
    }
    
    // 更新艺术品信息
    function updateArtwork(
        uint256 _artworkId,
        string memory _title,
        string memory _description,
        bool _isForSale,
        uint256 _price
    ) external {
        require(artworks[_artworkId].exists, "Artwork does not exist");
        require(artworks[_artworkId].creator == msg.sender, "Not the creator");
        
        Artwork storage artwork = artworks[_artworkId];
        artwork.title = _title;
        artwork.description = _description;
        artwork.isForSale = _isForSale;
        artwork.price = _price;
        
        emit ArtworkUpdated(
            _artworkId,
            _title,
            _description,
            _isForSale,
            _price
        );
    }
    
    // 购买艺术品
    function buyArtwork(uint256 _artworkId) external nonReentrant {
        Artwork storage artwork = artworks[_artworkId];
        
        require(artwork.exists, "Artwork does not exist");
        require(artwork.isForSale, "Artwork not for sale");
        require(artwork.creator != msg.sender, "Cannot buy your own artwork");
        
        uint256 price = artwork.price;
        address seller = artwork.creator;
        
        // 计算手续费
        uint256 fee = (price * feePercent) / PERCENT_DIVIDER;
        uint256 sellerAmount = price - fee;
        
        // 转移支付代币
        IERC20(paymentToken).transferFrom(msg.sender, seller, sellerAmount);
        IERC20(paymentToken).transferFrom(msg.sender, owner(), fee);
        
        // 如果是NFT，转移NFT所有权
        if (artwork.nftContract != address(0)) {
            IERC721(artwork.nftContract).transferFrom(seller, msg.sender, artwork.tokenId);
            
            // 更新艺术品所有者
            artwork.creator = msg.sender;
            
            // 从卖家的艺术品列表中移除
            removeArtworkFromUser(seller, _artworkId);
            
            // 添加到买家的艺术品列表
            userArtworks[msg.sender].push(_artworkId);
        }
        
        // 标记为不再出售
        artwork.isForSale = false;
        
        emit ArtworkSold(
            _artworkId,
            seller,
            msg.sender,
            price,
            fee
        );
    }
    
    // 从用户的艺术品列表中移除艺术品
    function removeArtworkFromUser(address _user, uint256 _artworkId) internal {
        uint256[] storage userArtworksList = userArtworks[_user];
        for (uint256 i = 0; i < userArtworksList.length; i++) {
            if (userArtworksList[i] == _artworkId) {
                // 将最后一个元素移到当前位置，然后删除最后一个元素
                userArtworksList[i] = userArtworksList[userArtworksList.length - 1];
                userArtworksList.pop();
                break;
            }
        }
    }
    
    // 获取用户的所有艺术品
    function getUserArtworks(address _user) external view returns (uint256[] memory) {
        return userArtworks[_user];
    }
    
    // 获取艺术品详情
    function getArtworkDetails(uint256 _artworkId) external view returns (
        uint256 id,
        address creator,
        string memory title,
        string memory description,
        string memory imageURI,
        bool isForSale,
        uint256 price,
        address nftContract,
        uint256 tokenId
    ) {
        Artwork memory artwork = artworks[_artworkId];
        require(artwork.exists, "Artwork does not exist");
        
        return (
            artwork.id,
            artwork.creator,
            artwork.title,
            artwork.description,
            artwork.imageURI,
            artwork.isForSale,
            artwork.price,
            artwork.nftContract,
            artwork.tokenId
        );
    }
    
    // 设置支付代币
    function setPaymentToken(address _paymentToken) external onlyOwner {
        paymentToken = _paymentToken;
    }
    
    // 设置手续费率
    function setFeePercent(uint256 _feePercent) external onlyOwner {
        feePercent = _feePercent;
    }
}