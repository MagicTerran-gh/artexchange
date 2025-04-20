// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Exchange is Ownable, ReentrancyGuard {
    // 手续费率（0.3%）
    uint256 public feePercent = 3;
    uint256 public constant PERCENT_DIVIDER = 1000;
    
    // 代币地址 => 是否支持
    mapping(address => bool) public supportedTokens;
    
    // 用户地址 => 代币地址 => 余额
    mapping(address => mapping(address => uint256)) public tokenBalances;
    
    // 订单结构
    struct Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
        bool fulfilled;
    }
    
    // 订单ID => 订单
    mapping(uint256 => Order) public orders;
    uint256 public orderCount;
    
    // 事件
    event Deposit(address user, address token, uint256 amount, uint256 balance);
    event Withdraw(address user, address token, uint256 amount, uint256 balance);
    event OrderCreated(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event OrderFulfilled(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
        uint256 timestamp
    );
    
    constructor() {}
    
    // 添加支持的代币
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }
    
    // 移除支持的代币
    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
    }
    
    // 存入代币
    function depositToken(address _token, uint256 _amount) external {
        require(supportedTokens[_token], "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");
        
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        tokenBalances[msg.sender][_token] += _amount;
        
        emit Deposit(msg.sender, _token, _amount, tokenBalances[msg.sender][_token]);
    }
    
    // 提取代币
    function withdrawToken(address _token, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(tokenBalances[msg.sender][_token] >= _amount, "Insufficient balance");
        
        tokenBalances[msg.sender][_token] -= _amount;
        IERC20(_token).transfer(msg.sender, _amount);
        
        emit Withdraw(msg.sender, _token, _amount, tokenBalances[msg.sender][_token]);
    }
    
    // 创建订单
    function createOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) external {
        require(supportedTokens[_tokenGet], "Token Get not supported");
        require(supportedTokens[_tokenGive], "Token Give not supported");
        require(_amountGet > 0, "Amount Get must be greater than 0");
        require(_amountGive > 0, "Amount Give must be greater than 0");
        require(tokenBalances[msg.sender][_tokenGive] >= _amountGive, "Insufficient balance");
        
        orderCount++;
        orders[orderCount] = Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp,
            false
        );
        
        emit OrderCreated(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }
    
    // 执行订单
    function fillOrder(uint256 _id) external nonReentrant {
        require(_id > 0 && _id <= orderCount, "Invalid order ID");
        require(!orders[_id].fulfilled, "Order already fulfilled");
        
        Order storage _order = orders[_id];
        
        // 检查余额
        require(tokenBalances[msg.sender][_order.tokenGet] >= _order.amountGet, "Insufficient balance");
        
        // 计算手续费
        uint256 fee = (_order.amountGet * feePercent) / PERCENT_DIVIDER;
        uint256 amountAfterFee = _order.amountGet - fee;
        
        // 执行交易
        tokenBalances[msg.sender][_order.tokenGet] -= _order.amountGet;
        tokenBalances[_order.user][_order.tokenGet] += amountAfterFee;
        tokenBalances[owner()][_order.tokenGet] += fee; // 手续费给平台所有者
        
        tokenBalances[_order.user][_order.tokenGive] -= _order.amountGive;
        tokenBalances[msg.sender][_order.tokenGive] += _order.amountGive;
        
        // 标记订单已完成
        _order.fulfilled = true;
        
        emit OrderFulfilled(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            _order.user,
            block.timestamp
        );
    }
    
    // 取消订单
    function cancelOrder(uint256 _id) external {
        require(_id > 0 && _id <= orderCount, "Invalid order ID");
        Order storage _order = orders[_id];
        require(_order.user == msg.sender, "Not your order");
        require(!_order.fulfilled, "Order already fulfilled");
        
        _order.fulfilled = true;
    }
    
    // 获取用户代币余额
    function getBalance(address _user, address _token) external view returns (uint256) {
        return tokenBalances[_user][_token];
    }
}