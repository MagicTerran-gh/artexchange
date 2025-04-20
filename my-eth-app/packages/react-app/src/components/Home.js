import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <HeroTitle>探索、收集和交易独特的数字艺术品</HeroTitle>
        <HeroSubtitle>基于以太坊区块链的去中心化艺术品交易平台</HeroSubtitle>
        <ButtonGroup>
          <ExploreButton to="/marketplace">探索市场</ExploreButton>
          <CreateButton to="/create">创建艺术品</CreateButton>
        </ButtonGroup>
      </Hero>
      
      <FeaturesSection>
        <SectionTitle>平台特点</SectionTitle>
        <Features>
          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>安全可靠</FeatureTitle>
            <FeatureDescription>基于以太坊区块链技术，确保交易安全透明</FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureTitle>低手续费</FeatureTitle>
            <FeatureDescription>仅收取2.5%的交易手续费，远低于传统平台</FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🎨</FeatureIcon>
            <FeatureTitle>创作者权益</FeatureTitle>
            <FeatureDescription>艺术家可以完全控制自己的作品定价和销售</FeatureDescription>
          </FeatureCard>
        </Features>
      </FeaturesSection>
      
      <HowItWorksSection>
        <SectionTitle>如何使用</SectionTitle>
        <Steps>
          <Step>
            <StepNumber>1</StepNumber>
            <StepTitle>连接钱包</StepTitle>
            <StepDescription>使用MetaMask或其他以太坊钱包连接到平台</StepDescription>
          </Step>
          
          <Step>
            <StepNumber>2</StepNumber>
            <StepTitle>创建账户</StepTitle>
            <StepDescription>设置你的个人资料，包括用户名和简介</StepDescription>
          </Step>
          
          <Step>
            <StepNumber>3</StepNumber>
            <StepTitle>上传艺术品</StepTitle>
            <StepDescription>创建并上传你的数字艺术品到区块链</StepDescription>
          </Step>
          
          <Step>
            <StepNumber>4</StepNumber>
            <StepTitle>买卖交易</StepTitle>
            <StepDescription>在市场上出售你的艺术品或购买他人的作品</StepDescription>
          </Step>
        </Steps>
      </HowItWorksSection>
    </HomeContainer>
  );
};

// 样式组件
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const Hero = styled.section`
  text-align: center;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, #3498db, #8e44ad);
  color: white;
  border-radius: 8px;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled(Link)`
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
`;

const ExploreButton = styled(Button)`
  background-color: white;
  color: #3498db;
  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-2px);
  }
`;

const CreateButton = styled(Button)`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #2c3e50;
`;

const FeaturesSection = styled.section`
  padding: 2rem 0;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const FeatureDescription = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
`;

const HowItWorksSection = styled.section`
  padding: 2rem 0;
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const StepTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const StepDescription = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
`;

export default Home;