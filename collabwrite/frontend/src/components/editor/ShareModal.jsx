import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ShareModal = ({ 
  documentId, 
  documentTitle, 
  onClose, 
  onShareSuccess 
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareLink, setShareLink] = useState('');

  const token = localStorage.getItem('authToken');

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!email) {
        setError('Please enter an email address');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/documents/${documentId}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sharedWith: email,
            permission: permission
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to share document');
        setLoading(false);
        return;
      }

      setShareLink(data.shareData.shareLink);
      setSuccess(`✅ Document shared with ${permission} permission!`);
      setEmail('');
      onShareSuccess?.(data);

    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('✅ Link copied to clipboard!');
  };

  const modalContent = (
    <div style={{all:'initial',display:'block',position:'fixed',top:'0',left:'0',width:'100vw',height:'100vh',background:'rgba(0,0,0,0.6)',zIndex:'9999',overflow:'hidden'}}>
      <div style={{all:'initial',display:'flex',alignItems:'center',justifyContent:'center',position:'absolute',top:'0',left:'0',width:'100%',height:'100%'}}>
        
        <div style={{all:'initial',display:'block',background:'white',borderRadius:'12px',padding:'40px',width:'450px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',position:'relative'}}>
          
          {/* CLOSE BUTTON */}
          <button onClick={onClose} style={{all:'initial',position:'absolute',top:'15px',right:'15px',background:'none',border:'none',fontSize:'28px',cursor:'pointer',color:'#999',padding:'0',width:'30px',height:'30px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>

          {/* TITLE */}
          <h2 style={{all:'initial',display:'block',marginTop:'0',marginBottom:'25px',fontSize:'24px',color:'#333',fontWeight:'bold',textAlign:'center'}}>📤 Share Document</h2>

          {/* ERROR */}
          {error && <div style={{all:'initial',display:'block',padding:'12px',background:'#ffebee',color:'#c62828',borderRadius:'6px',marginBottom:'15px',fontSize:'14px',textAlign:'center'}}>{error}</div>}

          {/* SUCCESS */}
          {success && <div style={{all:'initial',display:'block',padding:'12px',background:'#e8f5e9',color:'#2e7d32',borderRadius:'6px',marginBottom:'15px',fontSize:'14px',textAlign:'center'}}>{success}</div>}

          {/* FORM */}
          {!shareLink ? (
            <form onSubmit={handleShare} style={{all:'initial',display:'block'}}>
              
              {/* EMAIL */}
              <div style={{all:'initial',display:'block',marginBottom:'20px'}}>
                <label style={{all:'initial',display:'block',marginBottom:'8px',fontWeight:'bold',color:'#333',fontSize:'14px'}}>📧 Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  style={{all:'initial',display:'block',width:'100%',padding:'12px',border:'2px solid #ddd',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box',fontFamily:'Arial, sans-serif',background:'white',color:'#333'}}
                />
              </div>

              {/* PERMISSION */}
              <div style={{all:'initial',display:'block',marginBottom:'25px'}}>
                <label style={{all:'initial',display:'block',marginBottom:'12px',fontWeight:'bold',color:'#333',fontSize:'14px'}}>🔐 Permission Level</label>
                
                {/* OPTION 1 */}
                <div style={{all:'initial',display:'block',marginBottom:'10px',cursor:'pointer'}} onClick={()=>setPermission('view')}>
                  <label style={{all:'initial',display:'flex',alignItems:'center',padding:'14px',border:permission==='view'?'2px solid #667eea':'2px solid #ddd',borderRadius:'8px',cursor:'pointer',backgroundColor:permission==='view'?'#f0f7ff':'#f9f9f9',gap:'12px'}}>
                    <input type="radio" value="view" checked={permission==='view'} onChange={(e)=>setPermission(e.target.value)} style={{all:'initial',width:'18px',height:'18px',cursor:'pointer'}} />
                    <div style={{all:'initial',display:'block'}}>
                      <div style={{all:'initial',display:'block',fontWeight:'bold',color:'#333',fontSize:'14px'}}>👁️ View Only</div>
                      <div style={{all:'initial',display:'block',color:'#666',fontSize:'12px',marginTop:'2px'}}>Can read but cannot edit</div>
                    </div>
                  </label>
                </div>

                {/* OPTION 2 */}
                <div style={{all:'initial',display:'block',cursor:'pointer'}} onClick={()=>setPermission('edit')}>
                  <label style={{all:'initial',display:'flex',alignItems:'center',padding:'14px',border:permission==='edit'?'2px solid #667eea':'2px solid #ddd',borderRadius:'8px',cursor:'pointer',backgroundColor:permission==='edit'?'#f0f7ff':'#f9f9f9',gap:'12px'}}>
                    <input type="radio" value="edit" checked={permission==='edit'} onChange={(e)=>setPermission(e.target.value)} style={{all:'initial',width:'18px',height:'18px',cursor:'pointer'}} />
                    <div style={{all:'initial',display:'block'}}>
                      <div style={{all:'initial',display:'block',fontWeight:'bold',color:'#333',fontSize:'14px'}}>✏️ Can Edit</div>
                      <div style={{all:'initial',display:'block',color:'#666',fontSize:'12px',marginTop:'2px'}}>Can read and modify document</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* BUTTONS */}
              <div style={{all:'initial',display:'flex',gap:'10px',marginTop:'30px'}}>
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{all:'initial',display:'block',flex:'1',padding:'12px',background:loading||!email?'#ccc':'#667eea',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',fontSize:'14px',cursor:loading||!email?'not-allowed':'pointer'}}
                >
                  {loading ? '⏳ Sharing...' : '📤 Share'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{all:'initial',display:'block',flex:'1',padding:'12px',background:'#e0e0e0',color:'#333',border:'none',borderRadius:'8px',fontWeight:'bold',fontSize:'14px',cursor:'pointer'}}
                >
                  Close
                </button>
              </div>
            </form>
          ) : (
            <div style={{all:'initial',display:'block'}}>
              <p style={{all:'initial',display:'block',textAlign:'center',color:'#2e7d32',fontWeight:'bold',fontSize:'16px',marginBottom:'20px',margin:'0 0 20px 0'}}>✅ Shared Successfully!</p>
              
              <div style={{all:'initial',display:'block',marginBottom:'20px'}}>
                <label style={{all:'initial',display:'block',marginBottom:'8px',fontWeight:'bold',color:'#333',fontSize:'14px'}}>Share Link:</label>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  style={{all:'initial',display:'block',width:'100%',padding:'10px',border:'2px solid #ddd',borderRadius:'8px',fontSize:'12px',background:'#f9f9f9',fontFamily:'monospace',boxSizing:'border-box',color:'#333'}}
                />
              </div>

              <div style={{all:'initial',display:'flex',gap:'10px'}}>
                <button
                  onClick={copyToClipboard}
                  style={{all:'initial',display:'block',flex:'1',padding:'12px',background:'#4CAF50',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'}}
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={onClose}
                  style={{all:'initial',display:'block',flex:'1',padding:'12px',background:'#e0e0e0',color:'#333',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'}}
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ShareModal;