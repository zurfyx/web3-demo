pragma solidity ^0.4.0;

contract SimpleChat {
    struct Message {
        address owner;
        string message;
        uint created;
    }
    Message[] public messages;
    uint public messagesCount;
    
    function postMessage(string _message) public {
        Message memory newMessage = Message({
            owner: msg.sender,
            message: _message,
            created: now
        });
        messages.push(newMessage);
        messagesCount++;
    }
}