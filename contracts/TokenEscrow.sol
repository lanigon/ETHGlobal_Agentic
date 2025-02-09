// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 引入 OpenZeppelin 的 IERC20 接口和 Ownable 合约
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenEscrow is Ownable {
    IERC20 public token;
    uint256 public claimPeriod;

    enum DepositStatus { Pending, Claimed, Refunded }

    struct Deposit {
        address sender;       // 发起存款的人
        address recipient;    // 预定接收存款的人
        uint256 amount;       // 存款数量
        uint256 timestamp;    // 存款时间（用于计算是否超过认领期限）
        DepositStatus status; // 当前存款状态
    }

    mapping(uint256 => Deposit) public deposits;
    uint256 public depositCounter;  // 存款计数器

    event Deposited(uint256 indexed depositId, address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp);
    event Claimed(uint256 indexed depositId, address indexed recipient, uint256 amount, uint256 timestamp);
    event Refunded(uint256 indexed depositId, address indexed sender, uint256 amount, uint256 timestamp);

    constructor(address _token, uint256 _claimPeriod) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
        claimPeriod = _claimPeriod;
    }

    function deposit(address recipient, uint256 amount) external returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");

        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        depositCounter++;
        uint256 depositId = depositCounter;
        deposits[depositId] = Deposit({
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            timestamp: block.timestamp,
            status: DepositStatus.Pending
        });

        emit Deposited(depositId, msg.sender, recipient, amount, block.timestamp);
        return depositId;
    }

    function claim(uint256 depositId) external {
        Deposit memory d = deposits[depositId];
        require(d.status == DepositStatus.Pending, "Deposit not pending");
        require(msg.sender == d.recipient, "Only designated recipient can claim");
        require(block.timestamp <= d.timestamp + claimPeriod, "Claim period expired");

        d.status = DepositStatus.Claimed;
        require(token.transfer(d.recipient, d.amount), "Token transfer failed");

        emit Claimed(depositId, d.recipient, d.amount, block.timestamp);
    }

    function refund(uint256 depositId) external {
        Deposit memory d = deposits[depositId];
        require(d.status == DepositStatus.Pending, "Deposit not pending");
        require(msg.sender == d.sender, "Only sender can refund");
        require(block.timestamp > d.timestamp + claimPeriod, "Claim period not expired");

        d.status = DepositStatus.Refunded;
        require(token.transfer(d.sender, d.amount), "Token transfer failed");

        emit Refunded(depositId, d.sender, d.amount, block.timestamp);
    }
}
