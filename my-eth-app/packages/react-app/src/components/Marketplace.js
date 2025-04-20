import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import styled from "styled-components";

const Marketplace = ({ artMarketplace, account }) => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      if (artMarketplace) {
        try {
          const count = await artMarketplace.artworkCount();
          const artworksArray = [];

          for (let i = 1; i <= count; i++) {
            const artwork = await artMarketplace.getArtworkDetails(i);
            if (artwork.isForSale) {
              artworksArray.push({
                id: artwork.id.toString(),
                creator: artwork.creator,
                title: artwork.title,
                description: artwork.description,
                imageURI: artwork.imageURI,
                isForSale: artwork.isForSale,
                price: ethers.utils.formatEther(artwork.price),
                nftContract: artwork.nftContract,
                tokenId: artwork.tokenId.toString()
              });
            }
          }

          setArtworks(artworksArray);
          setLoading(false);
        } catch (error) {
          console.error("获取艺术品失败:", error);
          setLoading(false);
        }
      }
    };

    fetchArtworks();
  }, [artMarketplace]);

  return (
    <MarketplaceContainer>
      <MarketplaceHeader>
        <h1>艺术品市场</h1>
        <p>探索并收集独特的数字艺术品</p>
      </MarketplaceHeader>

      {loading ? (
        <Loading>加载艺术品中...</Loading>
      ) : artworks.length === 0 ? (
        <NoArtworks>
          <p>目前市场上没有艺术品出售</p>
          <CreateLink to="/create">创建第一个艺术品</CreateLink>
        </NoArtworks>
      ) : (
        <ArtworksGrid>
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id}>
              <ArtworkImage src={artwork.imageURI} alt={artwork.title} />
              <ArtworkInfo>
                <ArtworkTitle>{artwork.title}</ArtworkTitle>
                <ArtworkCreator>
                  创作者: {artwork.creator.substring(0, 6)}...{artwork.creator.substring(artwork.creator.length - 4)}
                </ArtworkCreator>
                <ArtworkPrice>{artwork.price} ACT</ArtworkPrice>
                <ViewButton to={`/artwork/${artwork.id}`}>查看详情</ViewButton>
              </ArtworkInfo>
            </ArtworkCard>
          ))}
        </ArtworksGrid>
      )}
    </MarketplaceContainer>
  );
};

// 样式组件
const MarketplaceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MarketplaceHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1.2rem;
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #7f8c8d;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  height: 200px;
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

const ArtworkCreator = styled.p`
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

export default Marketplace;