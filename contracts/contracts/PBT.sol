// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PBT is ERC20, Ownable {
    event Converted(string agentId, uint256 timestamp);

    constructor() ERC20("PreBull Ticket", "PBT") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function recordConversion(string calldata agentId) external onlyOwner {
        emit Converted(agentId, block.timestamp);
    }
}
