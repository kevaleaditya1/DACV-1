// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DACVRegistry
 * @dev Decentralized Academic Credential Verification Registry
 */
contract DACVRegistry is Ownable, ReentrancyGuard, Pausable {
    
    struct Credential {
        bytes32 credentialHash;
        string ipfsHash;
        address issuer;
        address student;
        string credentialType;
        uint256 issueDate;
        uint256 expiryDate;
        bool isRevoked;
        bool exists;
    }
    
    struct Issuer {
        string name;
        string country;
        bool isActive;
        uint256 registrationDate;
        uint256 credentialsIssued;
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => Issuer) public issuers;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => bytes32[]) public studentCredentials;
    mapping(address => bytes32[]) public issuerCredentials;
    
    // Events
    event IssuerAdded(address indexed issuer, string name, string country);
    event IssuerRemoved(address indexed issuer);
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed issuer,
        address indexed student,
        string credentialType,
        string ipfsHash
    );
    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer);
    event CredentialVerified(bytes32 indexed credentialId, address indexed verifier);
    
    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        require(issuers[msg.sender].isActive, "Issuer is not active");
        _;
    }
    
    modifier credentialExists(bytes32 _credentialId) {
        require(credentials[_credentialId].exists, "Credential does not exist");
        _;
    }
    
    modifier notRevoked(bytes32 _credentialId) {
        require(!credentials[_credentialId].isRevoked, "Credential is revoked");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Add a new authorized issuer
     */
    function addIssuer(
        address _issuer,
        string calldata _name,
        string calldata _country
    ) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(!authorizedIssuers[_issuer], "Issuer already exists");
        
        authorizedIssuers[_issuer] = true;
        issuers[_issuer] = Issuer({
            name: _name,
            country: _country,
            isActive: true,
            registrationDate: block.timestamp,
            credentialsIssued: 0
        });
        
        emit IssuerAdded(_issuer, _name, _country);
    }
    
    /**
     * @dev Remove an issuer
     */
    function removeIssuer(address _issuer) external onlyOwner {
        require(authorizedIssuers[_issuer], "Issuer does not exist");
        
        authorizedIssuers[_issuer] = false;
        issuers[_issuer].isActive = false;
        
        emit IssuerRemoved(_issuer);
    }
    
    /**
     * @dev Issue a new credential
     */
    function issueCredential(
        address _student,
        string calldata _ipfsHash,
        string calldata _credentialType,
        uint256 _expiryDate
    ) external onlyAuthorizedIssuer whenNotPaused nonReentrant returns (bytes32) {
        require(_student != address(0), "Invalid student address");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_credentialType).length > 0, "Credential type cannot be empty");
        
        bytes32 credentialId = keccak256(
            abi.encodePacked(
                msg.sender,
                _student,
                _ipfsHash,
                _credentialType,
                block.timestamp
            )
        );
        
        require(!credentials[credentialId].exists, "Credential already exists");
        
        bytes32 credentialHash = keccak256(abi.encodePacked(_ipfsHash));
        
        credentials[credentialId] = Credential({
            credentialHash: credentialHash,
            ipfsHash: _ipfsHash,
            issuer: msg.sender,
            student: _student,
            credentialType: _credentialType,
            issueDate: block.timestamp,
            expiryDate: _expiryDate,
            isRevoked: false,
            exists: true
        });
        
        studentCredentials[_student].push(credentialId);
        issuerCredentials[msg.sender].push(credentialId);
        issuers[msg.sender].credentialsIssued++;
        
        emit CredentialIssued(credentialId, msg.sender, _student, _credentialType, _ipfsHash);
        
        return credentialId;
    }
    
    /**
     * @dev Revoke a credential
     */
    function revokeCredential(bytes32 _credentialId) 
        external 
        credentialExists(_credentialId) 
        whenNotPaused 
    {
        require(
            credentials[_credentialId].issuer == msg.sender || msg.sender == owner(),
            "Only issuer or owner can revoke"
        );
        require(!credentials[_credentialId].isRevoked, "Already revoked");
        
        credentials[_credentialId].isRevoked = true;
        
        emit CredentialRevoked(_credentialId, msg.sender);
    }
    
    /**
     * @dev Verify a credential
     */
    function verifyCredential(bytes32 _credentialId) 
        external 
        view 
        credentialExists(_credentialId) 
        returns (
            bool isValid,
            address issuer,
            address student,
            string memory credentialType,
            uint256 issueDate,
            uint256 expiryDate,
            bool isRevoked
        ) 
    {
        Credential memory cred = credentials[_credentialId];
        
        bool expired = cred.expiryDate > 0 && block.timestamp > cred.expiryDate;
        isValid = !cred.isRevoked && !expired && authorizedIssuers[cred.issuer];
        
        return (
            isValid,
            cred.issuer,
            cred.student,
            cred.credentialType,
            cred.issueDate,
            cred.expiryDate,
            cred.isRevoked
        );
    }
    
    /**
     * @dev Get student's credentials
     */
    function getStudentCredentials(address _student) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return studentCredentials[_student];
    }
    
    /**
     * @dev Get issuer's credentials
     */
    function getIssuerCredentials(address _issuer) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return issuerCredentials[_issuer];
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}