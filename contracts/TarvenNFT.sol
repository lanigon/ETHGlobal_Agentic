// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TarvenNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    address public aiAddress;
    
    constructor(address _aiAddress) ERC721("Tarven NFT", "TARVENNFT") Ownable(msg.sender) {
        require(_aiAddress != address(0), "Invalid AI address");
        aiAddress = _aiAddress;
        _tokenIds = 0; 
    }
    
    modifier onlyAI() {
        require(msg.sender == aiAddress, "Only AI can call this function");
        _;
    }
    
    function updateAIAddress(address _newAIAddress) external onlyOwner {
        require(_newAIAddress != address(0), "Invalid new AI address");
        aiAddress = _newAIAddress;
    }

    function mintNFT(address recipient, string memory tokenURI) external onlyAI returns (uint256) {
        _tokenIds++; 
        uint256 newItemId = _tokenIds;
        
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        return newItemId;
    }
}
