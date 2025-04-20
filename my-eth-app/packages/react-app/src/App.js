import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress, Sepolia } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";

// 导入合约ABI和地址
import ArtTokenABI from "./contracts/ArtToken.json";
import ArtNFTABI from "./contracts/ArtNFT.json";
import ArtMarketplaceABI from "./contracts/ArtMarketplace.json";
import addresses from "./contracts/addresses.js";

// 导入组件
import { FileUpload } from "./components";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateArtwork from "./components/CreateArtwork";
import Marketplace from "./components/Marketplace";
import ArtworkDetail from "./components/ArtworkDetail";

const App = () => {
  const { activateBrowserWallet, account, library } = useEthers();
  const [artToken, setArtToken] = useState(null);
  const [artNFT, setArtNFT] = useState(null);
  const [artMarketplace, setArtMarketplace] = useState(null);
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(true);

  // 连接到合约
  useEffect(() => {
    const initContracts = async () => {
      if (library) {
        const signer = library.getSigner();
        
        // 初始化合约实例
        const tokenContract = new ethers.Contract(addresses.artToken, ArtTokenABI, signer);
        const nftContract = new ethers.Contract(addresses.artNFT, ArtNFTABI, signer);
        const marketplaceContract = new ethers.Contract(addresses.artMarketplace, ArtMarketplaceABI, signer);
        
        setArtToken(tokenContract);
        setArtNFT(nftContract);
        setArtMarketplace(marketplaceContract);
        
        // 获取代币余额
        if (account) {
          const balance = await tokenContract.balanceOf(account);
          setBalance(ethers.utils.formatEther(balance));
        }
        
        setIsLoading(false);
      }
    };
    
    initContracts();
  }, [library, account]);

  // 连接钱包
  const connectWallet = () => {
    activateBrowserWallet();
  };

  return (
    <AppContainer>
      <Router>
        <Header>
          <Logo>艺术品交易平台</Logo>
          <Nav>
            <StyledLink to="/">首页</StyledLink>
            <StyledLink to="/marketplace">市场</StyledLink>
            <StyledLink to="/create">创建艺术品</StyledLink>
            {account && <StyledLink to="/profile">我的资料</StyledLink>}
          </Nav>
          <WalletInfo>
            {account ? (
              <>
                <Balance>{balance} ACT</Balance>
                <Account>{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</Account>
              </>
            ) : (
              <ConnectButton onClick={connectWallet}>连接钱包</ConnectButton>
            )}
          </WalletInfo>
        </Header>

        <MainContent>
          {isLoading ? (
            <Loading>加载中...</Loading>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/marketplace" 
                element={<Marketplace artMarketplace={artMarketplace} account={account} />} 
              />
              <Route 
                path="/create" 
                element={
                  <CreateArtwork 
                    artNFT={artNFT} 
                    artMarketplace={artMarketplace} 
                    account={account} 
                  />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <Profile 
                    artMarketplace={artMarketplace} 
                    account={account} 
                  />
                } 
              />
              <Route 
                path="/artwork/:id" 
                element={
                  <ArtworkDetail 
                    artMarketplace={artMarketplace} 
                    artToken={artToken}
                    account={account} 
                  />
                } 
              />
            </Routes>
          )}
        </MainContent>

        <Footer>
          <p>© 2023 艺术品交易平台 - 基于以太坊区块链</p>
        </Footer>
      </Router>
    </AppContainer>
  );
};

// 样式组件
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Balance = styled.span`
  background-color: #3498db;
  padding: 0.5rem;
  border-radius: 4px;
`;

const Account = styled.span`
  background-color: #2ecc71;
  padding: 0.5rem;
  border-radius: 4px;
`;

const ConnectButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background-color: #c0392b;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.5rem;
  color: #7f8c8d;
`;

const Footer = styled.footer`
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
`;

export default App;
