import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import styled from "styled-components";

const Profile = ({ artMarketplace, account }) => {
  const [user, setUser] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (artMarketplace && account) {
        try {
          // 获取用户信息
          const userData = await artMarketplace.users(account);
          setUser({
            username: userData.username,
            profileImage: userData.profileImage,
            bio: userData.bio,
            isRegistered: userData.isRegistered
          });
          
          setUsername(userData.username);
          setProfileImage(userData.profileImage);
          setBio(userData.bio);
          
          // 获取用户的艺术品
          if (userData.isRegistered) {
            const artworkIds = await artMarketplace.getUserArtworks(account);
            const artworksArray = [];
            
            for (let i = 0; i < artworkIds.length; i++) {
              const artwork = await artMarketplace.getArtworkDetails(artworkIds[i]);
              artworksArray.push({
                id: artwork.id.toString(),
                title: artwork.title,
                description: artwork.description,
                imageURI: artwork.imageURI,
                isForSale: artwork.isForSale,
                price: ethers.utils.formatEther(artwork.price)
              });
            }
            
            setArtworks(artworksArray);
          }
          
          setLoading(false);
        } catch (error) {
          console.error("获取用户数据失败:", error);
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [artMarketplace, account]);

  const handleRegister = async () => {
    if (!account) {
      setError("请先连接钱包");
      return;
    }
    
    try {
      setIsUpdating(true);
      setError("");
      
      const defaultUsername = "User_" + account.substring(2, 8);
      const defaultProfileImage = "https://via.placeholder.com/150";
      const defaultBio = "艺术爱好者";
      
      const tx = await artMarketplace.registerUser(defaultUsername, defaultProfileImage, defaultBio);
      await tx.wait();
      
      setUser({
        username: defaultUsername,
        profileImage: defaultProfileImage,
        bio: defaultBio,
        isRegistered: true
      });
      
      setUsername(defaultUsername);
      setProfileImage(defaultProfileImage);
      setBio(defaultBio);
      
      setSuccess("注册成功！");
      setIsUpdating(false);
    } catch (error) {
      console.error("注册用户失败:", error);
      setError("注册用户失败: " + (error.message || "未知错误"));
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError("请先连接钱包");
      return;
    }
    
    if (!username) {
      setError("用户名不能为空");
      return;
    }
    
    try {
      setIsUpdating(true);
      setError("");
      setSuccess("");
      
      const tx = await artMarketplace.updateUserProfile(username, profileImage, bio);
      await tx.wait();
      
      setUser({
        ...user,
        username,
        profileImage,
        bio
      });
      
      setSuccess("资料更新成功！");
      setIsEditing(false);
      setIsUpdating(false);
    } catch (error) {
      console.error("更新资料失败:", error);
      setError("更新资料失败: " + (error.message || "未知错误"));
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <Loading>加载用户数据中...</Loading>;
  }

  if (!account) {
    return (
      <Container>
        <Title>用户资料</Title>
        <Message>请先连接钱包以查看您的资料</Message>
      </Container>
    );
  }

  if (!user || !user.isRegistered) {
    return (
      <Container>
        <Title>用户资料</Title>
        <Message>您尚未注册</Message>
        <Button onClick={handleRegister} disabled={isUpdating}>
          {isUpdating ? "处理中..." : "注册用户"}
        </Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Container>
    );
  }

  return (
    <Container>
      <Title>用户资料</Title>
      
      {isEditing ? (
        <Form onSubmit={handleUpdateProfile}>
          <FormGroup>
            <Label>用户名</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>头像URL</Label>
            <Input
              type="text"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="输入头像图片URL"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>个人简介</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="描述一下你自己..."
              rows={4}
            />
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <ButtonGroup>
            <SubmitButton type="submit" disabled={isUpdating}>
              {isUpdating ? "更新中..." : "保存资料"}
            </SubmitButton>
            <CancelButton type="button" onClick={() => setIsEditing(false)}>
              取消
            </CancelButton>
          </ButtonGroup>
        </Form>
      ) : (
        <ProfileSection>
          <ProfileHeader>
            <ProfileImage src={user.profileImage || "https://via.placeholder.com/150"} alt={user.username} />
            <ProfileInfo>
              <Username>{user.username}</Username>
              <Address>{account}</Address>
              <Bio>{user.bio}</Bio>
              <EditButton onClick={() => setIsEditing(true)}>编辑资料</EditButton>
            </ProfileInfo>
          </ProfileHeader>
          
          <ArtworksSection>
            <SectionTitle>我的艺术品</SectionTitle>
            
            {artworks.length === 0 ? (
              <NoArtworks>
                <p>您还没有创建任何艺术品</p>
                <CreateLink to="/create">创建第一个艺术品</CreateLink>
              </NoArtworks>
            ) : (
              <ArtworksGrid>
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id}>
                    <ArtworkImage src={artwork.imageURI} alt={artwork.title} />
                    <ArtworkInfo>
                      <ArtworkTitle>{artwork.title}</ArtworkTitle>
                      <ArtworkStatus>
                        状态: {artwork.isForSale ? "出售中" : "未出售"}
                      </ArtworkStatus>
                      {artwork.isForSale && (
                        <ArtworkPrice>{artwork.price} ACT</ArtworkPrice>
                      )}
                      <ViewButton to={`/artwork/${artwork.id}`}>查看详情</ViewButton>
                    </ArtworkInfo>
                  </ArtworkCard>
                ))}
              </ArtworksGrid>
            )}
          </ArtworksSection>
        </ProfileSection>
      )}
    </Container>
  );
};

// 样式组件
const Container = styled.div`
  max-width: 1000px;
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

const Message = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1rem;
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
  margin: 0 auto;
  display: block;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const Username = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
`;

const Address = styled.p`
  color: #7f8c8d;
  font-family: monospace;
  font-size: 0.9rem;
  margin: 0;
`;

const Bio = styled.p`
  color: #34495e;
  line-height: 1.6;
  margin: 0.5rem 0 1rem 0;
`;

const EditButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-self: flex-start;
  
  &:hover {
    background-color: #2980b9;
  }
  
  @media (max-width: 768px) {
    align-self: center;
  }
`;

const ArtworksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
`;

const NoArtworks = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 1rem;
  
  p {
    font-size: 1.2rem;
    color: #7f8c8d;
  }
`;

const CreateLink = styled(Link)`
  background-color: #3498db;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ArtworksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const ArtworkCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const ArtworkInfo = styled.div`
  padding: 1.5rem;
`;

const ArtworkTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
`;

const ArtworkStatus = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ArtworkPrice = styled.div`
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 1rem;
`;

const ViewButton = styled(Link)`
  display: block;
  background-color: #3498db;
  color: white;
  text-align: center;
  padding: 0.8rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #2980b9;
  }
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const SubmitButton = styled.button`
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex: 1;
  
  &:hover {
    background-color: #27ae60;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c0392b;
  }
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

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

export default Profile;

