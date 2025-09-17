import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useWeb3 } from '../contexts/Web3Context';
import QRCode from 'qrcode.react';

// Import real IPFS and verification utilities
import {
  uploadCredential,
  createCredentialMetadata,
  isIPFSConfigured,
  getIPFSStatus,
  retrieveJSONFromIPFS,
  getIPFSUrl,
  type CredentialMetadata
} from '../utils/ipfs';
// Import verification utilities
import { generateVerificationUrl } from '../utils/verification';
// Other utility functions available if needed
// import { formatCredentialId } from '../utils/verification';

interface IssuedCredential {
  id: string;
  student: string;
  type: string;
  issueDate: string;
  ipfsHash: string;
  verificationUrl: string;
  fileCID?: string; // For viewing the actual document
  metadataCID?: string; // For credential metadata
}

const University: React.FC = () => {
  const { account, contract, isConnected } = useWeb3();
  const [isAuthorizedIssuer, setIsAuthorizedIssuer] = useState(false);
  const [issuerInfo, setIssuerInfo] = useState<any>(null);
  const [issuingCredential, setIssuingCredential] = useState(false);
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [ipfsStatus, setIpfsStatus] = useState<{ configured: boolean; message: string }>({ configured: false, message: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    credentialType: 'degree',
    major: '',
    grade: '',
    expiryDate: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const loadIssuedCredentials = useCallback(async () => {
    if (!contract || !account) return;
    
    try {
      const credentialIds = await contract.getIssuerCredentials(account);
      const credentials: IssuedCredential[] = [];
      
      for (const id of credentialIds) {
        try {
          const result = await contract.verifyCredential(id);
          
          // Try to get file and metadata CIDs from IPFS metadata
          let fileCID = '';
          let metadataCID = result.ipfsHash || '';
          
          try {
            if (metadataCID) {
              const metadata = await retrieveJSONFromIPFS(metadataCID);
              fileCID = metadata.fileCID || '';
            }
          } catch (error) {
            console.log('Could not retrieve metadata for credential:', id);
          }
          
          credentials.push({
            id,
            student: result.student,
            type: result.credentialType,
            issueDate: new Date(Number(result.issueDate) * 1000).toLocaleDateString(),
            ipfsHash: result.ipfsHash || '',
            verificationUrl: generateVerificationUrl(id, await contract.getAddress(), 17000),
            fileCID,
            metadataCID,
          });
        } catch (error) {
          console.error('Error loading credential:', error);
        }
      }
      
      setIssuedCredentials(credentials);
    } catch (error) {
      console.error('Error loading issued credentials:', error);
    }
  }, [contract, account]);

  // Check if current account is an authorized issuer
  useEffect(() => {
    const checkIssuerStatus = async () => {
      if (contract && account) {
        try {
          const isAuthorized = await contract.authorizedIssuers(account);
          setIsAuthorizedIssuer(isAuthorized);
          
          if (isAuthorized) {
            const issuer = await contract.issuers(account);
            setIssuerInfo(issuer);
            loadIssuedCredentials();
          }
        } catch (error) {
          console.error('Error checking issuer status:', error);
        }
      }
    };

    // Check IPFS configuration
    const ipfsConfig = getIPFSStatus();
    setIpfsStatus(ipfsConfig);
    
    if (!ipfsConfig.configured) {
      console.warn('IPFS not configured:', ipfsConfig.message);
    }

    checkIssuerStatus();
  }, [contract, account, loadIssuedCredentials]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setSelectedFile(file);
        toast.success('File selected successfully');
      } else {
        toast.error('Please select a PDF or image file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const issueCredential = async () => {
    if (!contract || !account || !selectedFile) {
      toast.error('Please fill all required fields and select a file');
      return;
    }

    // Check IPFS configuration
    if (!isIPFSConfigured()) {
      toast.error('IPFS is not configured. Please set REACT_APP_NFT_STORAGE_KEY in your environment.');
      return;
    }

    setIssuingCredential(true);
    
    try {
      // Create metadata
      const metadata: CredentialMetadata = createCredentialMetadata(
        formData.studentName,
        formData.credentialType,
        issuerInfo?.name || 'Unknown University',
        formData.studentAddress,
        account,
        {
          major: formData.major,
          grade: formData.grade,
          expiryDate: formData.expiryDate || undefined,
          country: issuerInfo?.country || 'Unknown',
        }
      );

      // Upload to IPFS
      toast.success('Uploading credential to IPFS...');
      const { metadataCID } = await uploadCredential(selectedFile, metadata);
      toast.success('Credential uploaded to IPFS successfully!');
      
      // Issue credential on blockchain
      toast.success('Issuing credential on blockchain...');
      const expiryTimestamp = formData.expiryDate 
        ? Math.floor(new Date(formData.expiryDate).getTime() / 1000)
        : 0;
      
      const tx = await contract.issueCredential(
        formData.studentAddress,
        metadataCID,
        formData.credentialType,
        expiryTimestamp
      );
      
      await tx.wait();
      
      toast.success('Credential issued successfully!');
      
      // Reset form
      setFormData({
        studentAddress: '',
        studentName: '',
        credentialType: 'degree',
        major: '',
        grade: '',
        expiryDate: '',
      });
      setSelectedFile(null);
      
      // Reload credentials
      loadIssuedCredentials();
      
    } catch (error: any) {
      console.error('Error issuing credential:', error);
      
      // Provide specific error messages
      if (error.message?.includes('IPFS')) {
        toast.error('IPFS upload failed: ' + error.message);
      } else if (error.message?.includes('user rejected')) {
        toast.error('Transaction was rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else {
        toast.error(error.message || 'Failed to issue credential');
      }
    } finally {
      setIssuingCredential(false);
    }
  };

  const revokeCredential = async (credentialId: string) => {
    if (!contract) return;
    
    try {
      const tx = await contract.revokeCredential(credentialId);
      await tx.wait();
      toast.success('Credential revoked successfully');
      loadIssuedCredentials();
    } catch (error: any) {
      console.error('Error revoking credential:', error);
      toast.error(error.message || 'Failed to revoke credential');
    }
  };

  const viewDocument = async (credential: IssuedCredential) => {
    if (!credential.fileCID && !credential.metadataCID) {
      toast.error('No document available for this credential');
      return;
    }

    try {
      setViewingDocument(credential.id);
      
      // If we have fileCID, use it directly; otherwise try to get it from metadata
      let fileCID = credential.fileCID;
      
      if (!fileCID && credential.metadataCID) {
        const metadata = await retrieveJSONFromIPFS(credential.metadataCID);
        fileCID = metadata.fileCID;
      }
      
      if (fileCID) {
        const documentUrl = getIPFSUrl(fileCID);
        setDocumentUrl(documentUrl);
        console.log('Document URL:', documentUrl);
      } else {
        toast.error('Document file not found in IPFS');
        setViewingDocument(null);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to load document');
      setViewingDocument(null);
    }
  };

  const closeDocumentViewer = () => {
    setViewingDocument(null);
    setDocumentUrl(null);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">University Dashboard</h1>
        <p className="text-gray-600">Please connect your wallet to access the university dashboard.</p>
      </div>
    );
  }

  if (!isAuthorizedIssuer) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">University Dashboard</h1>
        <div className="card max-w-md mx-auto">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Authorized</h2>
          <p className="text-gray-600 mb-4">
            Your wallet address is not registered as an authorized issuer. 
            Please contact the system administrator to get your university registered.
          </p>
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-500 break-all">
            Your Address: {account}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">University Dashboard</h1>
        <p className="text-gray-600">Issue and manage academic credentials</p>
      </div>

      {issuerInfo && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Institution Information</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-500">Name</span>
              <p className="font-medium">{issuerInfo.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Country</span>
              <p className="font-medium">{issuerInfo.country}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Credentials Issued</span>
              <p className="font-medium">{issuerInfo.credentialsIssued?.toString()}</p>
            </div>
          </div>
          
          {/* IPFS Status */}
          <div className="mt-4 p-3 rounded border">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                ipfsStatus.configured ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                IPFS Status: {ipfsStatus.configured ? 'Connected' : 'Not Configured'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{ipfsStatus.message}</p>
            {!ipfsStatus.configured && (
              <p className="text-xs text-red-600 mt-1">
                Please set REACT_APP_NFT_STORAGE_KEY in your environment to enable file uploads.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Issue New Credential */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Issue New Credential</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Wallet Address *
              </label>
              <input
                type="text"
                name="studentAddress"
                value={formData.studentAddress}
                onChange={handleInputChange}
                className="input"
                placeholder="0x..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className="input"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential Type *
              </label>
              <select
                name="credentialType"
                value={formData.credentialType}
                onChange={handleInputChange}
                className="select"
                required
              >
                <option value="degree">Degree</option>
                <option value="diploma">Diploma</option>
                <option value="transcript">Transcript</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major/Field of Study
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                className="input"
                placeholder="Computer Science"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade/GPA
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                className="input"
                placeholder="3.8/4.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Credential Document *
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <div>
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-sm text-gray-600">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF or image files only
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={issueCredential}
            disabled={issuingCredential || !selectedFile || !formData.studentAddress || !formData.studentName}
            className="btn-primary w-full md:w-auto"
          >
            {issuingCredential ? 'Issuing Credential...' : 'Issue Credential'}
          </button>
        </div>
      </div>

      {/* Issued Credentials */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Issued Credentials</h2>
        
        {issuedCredentials.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No credentials issued yet</p>
        ) : (
          <div className="space-y-4">
            {issuedCredentials.map((credential) => (
              <div key={credential.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                        {credential.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        Issued on {credential.issueDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Student: {credential.student}
                    </p>
                    <p className="text-xs text-gray-400 break-all">
                      ID: {credential.id}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => viewDocument(credential)}
                      className="btn-primary text-sm"
                      disabled={!credential.fileCID && !credential.metadataCID}
                    >
                      View Document
                    </button>
                    <button
                      onClick={() => setShowQRCode(credential.id)}
                      className="btn-secondary text-sm"
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => revokeCredential(credential.id)}
                      className="btn-danger text-sm"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Verification QR Code</h3>
            <div className="flex justify-center mb-4">
              <QRCode
                value={issuedCredentials.find(c => c.id === showQRCode)?.verificationUrl || ''}
                size={200}
              />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Scan to verify credential
            </p>
            <button
              onClick={() => setShowQRCode(null)}
              className="btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && documentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Document Viewer</h3>
              <div className="flex space-x-2">
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={closeDocumentViewer}
                  className="btn-secondary text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              {documentUrl.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border rounded"
                  title="PDF Viewer"
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <img
                    src={documentUrl}
                    alt="Document"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default University;