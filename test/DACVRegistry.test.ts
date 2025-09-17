import { expect } from "chai";
import { ethers } from "hardhat";
import { DACVRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DACVRegistry", function () {
  let dacvRegistry: DACVRegistry;
  let owner: SignerWithAddress;
  let university1: SignerWithAddress;
  let university2: SignerWithAddress;
  let student1: SignerWithAddress;
  let student2: SignerWithAddress;
  let employer: SignerWithAddress;
  
  const UNIVERSITY_NAME = "Harvard University";
  const UNIVERSITY_COUNTRY = "USA";
  const IPFS_HASH = "QmTestHash123456789";
  const CREDENTIAL_TYPE = "degree";
  
  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    [owner, university1, university2, student1, student2, employer] = accounts;
    
    const DACVRegistryFactory = await ethers.getContractFactory("DACVRegistry");
    dacvRegistry = await DACVRegistryFactory.deploy();
    await dacvRegistry.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await dacvRegistry.owner()).to.equal(owner.address);
    });
    
    it("Should not be paused initially", async function () {
      expect(await dacvRegistry.paused()).to.equal(false);
    });
  });
  
  describe("Issuer Management", function () {
    it("Should allow owner to add an issuer", async function () {
      await expect(
        dacvRegistry.addIssuer(university1.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY)
      )
        .to.emit(dacvRegistry, "IssuerAdded")
        .withArgs(university1.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY);
      
      expect(await dacvRegistry.authorizedIssuers(university1.address)).to.be.true;
      
      const issuer = await dacvRegistry.issuers(university1.address);
      expect(issuer.name).to.equal(UNIVERSITY_NAME);
      expect(issuer.country).to.equal(UNIVERSITY_COUNTRY);
      expect(issuer.isActive).to.be.true;
    });
    
    it("Should not allow non-owner to add issuer", async function () {
      await expect(
        dacvRegistry.connect(university1).addIssuer(university2.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY)
      ).to.be.revertedWithCustomError(dacvRegistry, "OwnableUnauthorizedAccount");
    });
    
    it("Should not allow adding duplicate issuer", async function () {
      await dacvRegistry.addIssuer(university1.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY);
      
      await expect(
        dacvRegistry.addIssuer(university1.address, "Another Name", "Another Country")
      ).to.be.revertedWith("Issuer already exists");
    });
    
    it("Should allow owner to remove an issuer", async function () {
      await dacvRegistry.addIssuer(university1.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY);
      
      await expect(dacvRegistry.removeIssuer(university1.address))
        .to.emit(dacvRegistry, "IssuerRemoved")
        .withArgs(university1.address);
      
      expect(await dacvRegistry.authorizedIssuers(university1.address)).to.be.false;
      
      const issuer = await dacvRegistry.issuers(university1.address);
      expect(issuer.isActive).to.be.false;
    });
  });
  
  describe("Credential Issuance", function () {
    beforeEach(async function () {
      await dacvRegistry.addIssuer(university1.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY);
    });
    
    it("Should allow authorized issuer to issue credential", async function () {
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
      
      const tx = await dacvRegistry
        .connect(university1)
        .issueCredential(student1.address, IPFS_HASH, CREDENTIAL_TYPE, expiryDate);
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => 
        dacvRegistry.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "CredentialIssued"
      );
      
      expect(event).to.not.be.undefined;
      
      const studentCredentials = await dacvRegistry.getStudentCredentials(student1.address);
      expect(studentCredentials.length).to.equal(1);
      
      const issuerCredentials = await dacvRegistry.getIssuerCredentials(university1.address);
      expect(issuerCredentials.length).to.equal(1);
    });
    
    it("Should not allow unauthorized issuer to issue credential", async function () {
      await expect(
        dacvRegistry
          .connect(university2)
          .issueCredential(student1.address, IPFS_HASH, CREDENTIAL_TYPE, 0)
      ).to.be.revertedWith("Not an authorized issuer");
    });
    
    it("Should not allow issuing credential with empty IPFS hash", async function () {
      await expect(
        dacvRegistry
          .connect(university1)
          .issueCredential(student1.address, "", CREDENTIAL_TYPE, 0)
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
  });
  
  describe("Credential Verification", function () {
    let credentialId: string;
    
    beforeEach(async function () {
      await dacvRegistry.addIssuer(university1.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY);
      
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      const tx = await dacvRegistry
        .connect(university1)
        .issueCredential(student1.address, IPFS_HASH, CREDENTIAL_TYPE, expiryDate);
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => {
        const parsed = dacvRegistry.interface.parseLog({ topics: log.topics as string[], data: log.data });
        return parsed?.name === "CredentialIssued";
      });
      
      if (event) {
        const parsed = dacvRegistry.interface.parseLog({ topics: event.topics as string[], data: event.data });
        credentialId = parsed!.args[0];
      }
    });
    
    it("Should verify valid credential", async function () {
      const result = await dacvRegistry.verifyCredential(credentialId);
      
      expect(result.isValid).to.be.true;
      expect(result.issuer).to.equal(university1.address);
      expect(result.student).to.equal(student1.address);
      expect(result.credentialType).to.equal(CREDENTIAL_TYPE);
      expect(result.isRevoked).to.be.false;
    });
    
    it("Should allow issuer to revoke credential", async function () {
      await expect(dacvRegistry.connect(university1).revokeCredential(credentialId))
        .to.emit(dacvRegistry, "CredentialRevoked")
        .withArgs(credentialId, university1.address);
      
      const result = await dacvRegistry.verifyCredential(credentialId);
      expect(result.isValid).to.be.false;
      expect(result.isRevoked).to.be.true;
    });
    
    it("Should not allow non-issuer to revoke credential", async function () {
      await expect(
        dacvRegistry.connect(student1).revokeCredential(credentialId)
      ).to.be.revertedWith("Only issuer or owner can revoke");
    });
  });
  
  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await dacvRegistry.addIssuer(university1.address, UNIVERSITY_NAME, UNIVERSITY_COUNTRY);
    });
    
    it("Should allow owner to pause and unpause", async function () {
      await dacvRegistry.pause();
      expect(await dacvRegistry.paused()).to.be.true;
      
      await expect(
        dacvRegistry
          .connect(university1)
          .issueCredential(student1.address, IPFS_HASH, CREDENTIAL_TYPE, 0)
      ).to.be.revertedWithCustomError(dacvRegistry, "EnforcedPause");
      
      await dacvRegistry.unpause();
      expect(await dacvRegistry.paused()).to.be.false;
    });
  });
});