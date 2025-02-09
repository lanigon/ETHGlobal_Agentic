// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TarvenCoin is ERC20, Ownable {
    address public aiAddress;

    event Faucet(address indexed recipient, uint256 amount);
    
    constructor(address _aiAddress) ERC20("Tarven Coin", "TARVEN") Ownable(msg.sender) {
        require(_aiAddress != address(0), "Invalid AI address");
        aiAddress = _aiAddress;
        _mint(msg.sender, 10000 * 10 ** decimals());
    }
    
    modifier onlyAI() {
        require(msg.sender == aiAddress, "Only AI can call this function");
        _;
    }
    
    function updateAIAddress(address _newAIAddress) external onlyOwner {
        require(_newAIAddress != address(0), "Invalid new AI address");
        aiAddress = _newAIAddress;
    }
    
    function faucet(address recipient, uint256 amount) external onlyAI {
        _mint(recipient, amount);
        emit Faucet(recipient, amount);
    }
}
