import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import styled from "styled-components";

const ArtworkDetail = ({ artMarketplace, artToken, account }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchArtwork = async () => {
      if (artMarketplace && id) {
        try {
          const artworkData = await artMarketplace.getArtworkDetails(id);
          setArtwork({
            id: artworkData.id.toString(),
            creator: artworkData.creator,
            title: artworkData.title,
            description: artworkData.description,
            imageURI: artworkData.imageURI,
            isForSale: artworkData.isForSale,
            price: ethers.utils.formatEther(artworkData.price),
            nftContract: artworkData.nftContract,
            tokenId: artworkData.tokenId.toString()
          });
          setLoading(false);
        } catch (error) {
          console.error("获取艺术品详情失败:", error);
          setError("获取艺术品详情失败");
          setLoading(false);
        }
      }
    };

    fetchArtwork();
  }, [artMarketplace, id]);

  const handleBuy = async () => {
    if (!account) {
      setError("请先连接钱包");
      return;
    }

    if (artwork.creator.toLowerCase() === account.toLowerCase()) {
      setError("你不能购买自己的艺术品");
      return;
    }

    try {
      setBuying(true);
      setError("");
      setSuccess("");

      // 检查代币授权
      const price = ethers.utils.parseEther(artwork.price);
      const allowance = await artToken.allowance(account, artMarketplace.address);
      
      // 如果授权不足，先进行授权
      if (allowance.lt(price)) {
        const approveTx = await artToken.approve(artMarketplace.address, price);
        await approveTx.wait();
      }

      // 购买艺术品
      const buyTx = await artMarketplace.buyArtwork(id);
      await buyTx.wait();

      setSuccess("艺术品购买成功！");
      // 更新艺术品状态
      const updatedArtwork = await artMarketplace.getArtworkDetails(id);
      setArtwork({
        ...artwork,
        isForSale: updatedArtwork.isForSale,
        creator: updatedArtwork.creator
      });

      setBuying(false);
    } catch (error) {
      console.error("购买艺术品失败:", error);
      setError("购买艺术品失败: " + (error.message || "未知错误"));
      setBuying(false);
    }
  };

  if (loading) {
    return <Loading>加载艺术品详情中...</Loading>;
  }

  if (!artwork) {
    return <Error>艺术品不存在或已被删除</Error>;
  }

  return (
    <DetailContainer>
      <BackButton onClick={() => navigate(-1)}>← 返回</BackButton>
      
      <ArtworkContent>
        <ImageContainer>
          <ArtworkImage src={artwork.imageURI} alt={artwork.title} />
        </ImageContainer>
        
        <ArtworkInfo>
          <ArtworkTitle>{artwork.title}</ArtworkTitle>
          
          <CreatorInfo>
            创作者: {artwork.creator.substring(0, 6)}...{artwork.creator.substring(artwork.creator.length - 4)}
          </CreatorInfo>
          
          <ArtworkDescription>{artwork.description}</ArtworkDescription>
          
          <PriceContainer>
            <PriceLabel>价格:</PriceLabel>
            <Price>{artwork.price} ACT</Price>
          </PriceContainer>
          
          <SaleStatus>
            状态: {artwork.isForSale ? "出售中" : "已售出"}
          </SaleStatus>
          
          {artwork.isForSale && account && artwork.creator.toLowerCase() !== account.toLowerCase() && (
            <BuyButton onClick={handleBuy} disabled={buying}>
              {buying ? "处理中..." : "购买艺术品"}
            </BuyButton>
          )}
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <ArtworkDetails>
            <DetailItem>
              <DetailLabel>艺术品ID:</DetailLabel>
              <DetailValue>{artwork.id}</DetailValue>
            </DetailItem>
            
            {artwork.nftContract !== ethers.constants.AddressZero && (
              <>
                <DetailItem>
                  <DetailLabel>NFT合约:</DetailLabel>
                  <DetailValue>{artwork.nftContract}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Token ID:</DetailLabel>
                  <DetailValue>{artwork.tokenId}</DetailValue>
                </DetailItem>
              </>
            )}
          </ArtworkDetails>
        </ArtworkInfo>
      </ArtworkContent>
    </DetailContainer>
  );
};

// 样式组件
const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  text-align: left;
  width: fit-content;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ArtworkContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const ArtworkInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ArtworkTitle = styled.h1`
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
`;

const CreatorInfo = styled.div`
  color: #7f8c8d;
  font-size: 1rem;
`;

const ArtworkDescription = styled.p`
  color: #34495e;
  line-height: 1.6;
  font-size: 1.1rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PriceLabel = styled.span`
  font-size: 1.2rem;
  color: #7f8c8d;
`;

const Price = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
`;

const SaleStatus = styled.div`
  font-size: 1.1rem;
  color: #7f8c8d;
`;

const BuyButton = styled.button`
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #27ae60;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
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

const ArtworkDetails = styled.div`
  margin-top: 1rem;
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
`;

const DetailLabel = styled.span`
  color: #7f8c8d;
  width: 100px;
  flex-shrink: 0;
`;

const DetailValue = styled.span`
  color: #34495e;
  word-break: break-all;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2rem;
  color: #7f8c8d;
`;

const Error = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
`;

export default ArtworkDetail;