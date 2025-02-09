// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 引入 OpenZeppelin 的 ERC721URIStorage 和 Ownable 合约
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TarvenNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    address public aiAddress;

    event Minted(address indexed recipient, uint256 indexed tokenId, string tokenURI);
    
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
        
        emit Minted(recipient, newItemId, tokenURI);
        return newItemId;
    }
}
