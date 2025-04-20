import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import axios from 'axios';

export const FileUpload = ({ onFileUpload, setIsUploading }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }
    
    // 检查文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }

    try {
      setUploading(true);
      setIsUploading(true);
      setError('');
      
      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('file', file);
      
      // 上传到 IPFS 服务 (使用 Pinata 或其他 IPFS 服务)
      // 这里使用 nft.storage 作为示例
      const apiKey = 'YOUR_NFT_STORAGE_API_KEY'; // 请替换为你的 API 密钥
      
      const response = await axios.post('https://api.nft.storage/upload', formData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // 获取 IPFS URL
      const ipfsUrl = `https://ipfs.io/ipfs/${response.data.value.cid}`;
      
      // 调用回调函数，传递 IPFS URL
      onFileUpload(ipfsUrl);
      
      setUploading(false);
      setIsUploading(false);
    } catch (error) {
      console.error('上传文件失败:', error);
      setError('上传文件失败: ' + (error.message || '未知错误'));
      setUploading(false);
      setIsUploading(false);
    }
  }, [onFileUpload, setIsUploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <UploadContainer>
      <DropzoneContainer {...getRootProps()} isDragActive={isDragActive} isUploading={uploading}>
        <input {...getInputProps()} />
        {uploading ? (
          <UploadingText>上传中...</UploadingText>
        ) : isDragActive ? (
          <DropzoneText>拖放文件到这里</DropzoneText>
        ) : (
          <DropzoneText>
            拖放图片文件到这里，或点击选择文件<br />
            <small>支持 JPG, PNG, GIF 等格式，最大 10MB</small>
          </DropzoneText>
        )}
      </DropzoneContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploadContainer>
  );
};

// 样式组件
const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DropzoneContainer = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#3498db' : '#bdc3c7'};
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background-color: ${props => props.isDragActive ? 'rgba(52, 152, 219, 0.1)' : 'transparent'};
  transition: all 0.3s ease;
  opacity: ${props => props.isUploading ? 0.7 : 1};
  
  &:hover {
    border-color: #3498db;
    background-color: rgba(52, 152, 219, 0.05);
  }
`;

const DropzoneText = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
  
  small {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8rem;
  }
`;

const UploadingText = styled.p`
  margin: 0;
  color: #3498db;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  font-size: 0.9rem;
`;