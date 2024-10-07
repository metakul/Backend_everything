// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

contract Logger {
    // Define an event to log actions
    event LogAction(
        address indexed sender,  // The address initiating the log
        string action,           // Action performed
        string details,          // Additional details
        uint256 timestamp        // Timestamp of the log entry
    );

    // Function to log an action
    function logAction(string calldata action, string calldata details) external {
        emit LogAction(msg.sender, action, details, block.timestamp);
    }
}