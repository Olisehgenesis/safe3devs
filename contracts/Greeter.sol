// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Greeter
 * @dev A simple greeting contract for Safe3Devs QR Deploy SDK demonstration
 */
contract Greeter {
    string private greeting;

    /**
     * @dev Constructor that sets the initial greeting
     * @param _greeting The initial greeting message
     */
    constructor(string memory _greeting) {
        greeting = _greeting;
    }

    /**
     * @dev Get the current greeting
     * @return The current greeting message
     */
    function greet() public view returns (string memory) {
        return greeting;
    }

    /**
     * @dev Set a new greeting
     * @param _greeting The new greeting message
     */
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }

    /**
     * @dev Get the contract version
     * @return The version string
     */
    function version() public pure returns (string memory) {
        return "1.0.0";
    }

    /**
     * @dev Emit an event when greeting is updated
     */
    event GreetingUpdated(string oldGreeting, string newGreeting);

    /**
     * @dev Set greeting with event emission
     * @param _greeting The new greeting message
     */
    function setGreetingWithEvent(string memory _greeting) public {
        string memory oldGreeting = greeting;
        greeting = _greeting;
        emit GreetingUpdated(oldGreeting, _greeting);
    }
}
