import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import styled from "styled-components";
import { FileUpload } from "./FileUpload";

const CreateArtwork = ({ artNFT, artMarketplace, account }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [price, setPrice] = useState("");
  const [isForSale, setIsForSale] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      if (artMarketplace && account) {
        try {
          const user = await artMarketplace.users(account);
          setIsRegistered(user.isRegistered);
        } catch (error) {
          console.error("检查用户注册状态失败:", error);
        }
      }
    };

    checkRegistration();
  }, [artMarketplace, account]);

  const handleImageUpload = (uri) => {
    setImageURI(uri);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError("请先连接钱包");
      return;
    }
    
    if (!isRegistered) {
      setError("请先注册用户");
      return;
    }
    
    if (!title) {
      setError("请输入艺术品标题");
      return;
    }
    
    if (!imageURI) {
      setError("请上传艺术品图片");
      return;
    }
    
    if (isForSale && (!price || parseFloat(price) <= 0)) {
      setError("请输入有效的价格");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      
      // 铸造NFT
      const mintTx = await artNFT.mint(imageURI);
      const receipt = await mintTx.wait();
      
      // 从事件中获取tokenId
      const transferEvent = receipt.events.find(event => event.event === 'Transfer');
      const tokenId = transferEvent.args.tokenId.toString();
      
      // 创建艺术品
      const priceInWei = isForSale ? ethers.utils.parseEther(price) : 0;
      const createTx = await artMarketplace.createArtwork(
        title,
        description,
        imageURI,
        isForSale,
        priceInWei,
        artNFT.address,
        tokenId
      );
      
      await createTx.wait();
      
      setSuccess("艺术品创建成功！");
      setIsLoading(false);
      
      // 重置表单
      setTitle("");
      setDescription("");
      setImageURI("");
      setPrice("");
      setIsForSale(true);
      
      // 延迟导航到市场页面
      setTimeout(() => {
        navigate("/marketplace");
      }, 2000);
      
    } catch (error) {
      console.error("创建艺术品失败:", error);
      setError("创建艺术品失败: " + (error.message || "未知错误"));
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!account) {
      setError("请先连接钱包");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      const username = "User_" + account.substring(2, 8);
      const profileImage = "https://via.placeholder.com/150";
      const bio = "艺术爱好者";
      
      const tx = await artMarketplace.registerUser(username, profileImage, bio);
      await tx.wait();
      
      setIsRegistered(true);
      setIsLoading(false);
    } catch (error) {
      console.error("注册用户失败:", error);
      setError("注册用户失败: " + (error.message || "未知错误"));
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <Container>
        <Title>创建艺术品</Title>
        <Message>请先连接钱包以创建艺术品</Message>
      </Container>
    );
  }

  if (!isRegistered) {
    return (
      <Container>
        <Title>创建艺术品</Title>
        <Message>您需要先注册才能创建艺术品</Message>
        <Button onClick={handleRegister} disabled={isLoading}>
          {isLoading ? "处理中..." : "注册用户"}
        </Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Container>
    );
  }

  return (
    <Container>
      <Title>创建新艺术品</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>艺术品标题</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入艺术品标题"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>描述</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述你的艺术品..."
            rows={4}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>上传图片</Label>
          <FileUpload 
            onFileUpload={handleImageUpload} 
            setIsUploading={setIsUploading}
          />
          {imageURI && (
            <PreviewContainer>
              <PreviewImage src={imageURI} alt="预览" />
            </PreviewContainer>
          )}
        </FormGroup>
        
        <FormGroup>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              checked={isForSale}
              onChange={(e) => setIsForSale(e.target.checked)}
              id="isForSale"
            />
            <CheckboxLabel htmlFor="isForSale">出售此艺术品</CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>
        
        {isForSale && (
          <FormGroup>
            <Label>价格 (ACT)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="输入价格"
              step="0.01"
              min="0"
              required={isForSale}
            />
          </FormGroup>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <SubmitButton 
          type="submit" 
          disabled={isLoading || isUploading || !imageURI}
        >
          {isLoading ? "创建中..." : "创建艺术品"}
        </SubmitButton>
      </Form>
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: #34495e;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`;

const CheckboxLabel = styled.label`
  color: #34495e;
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  overflow: hidden;
  max-width: 300px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const SubmitButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
`;

export default CreateArtwork;