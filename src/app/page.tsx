"use client";

import React from "react";
import { Layout } from "antd";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <Layout className="h-screen">
      <Header className="bg-[#9abda5] flex items-center">
        <div className="demo-logo" />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <div
          style={{
            background: "#fff",
            minHeight: 280,
            padding: 24,
            borderRadius: 10,
            margin: "16px 0",
            height: "100%",
          }}
        >
          Content
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>Ant Design ©{new Date().getFullYear()} Created by Ant UED</Footer>
    </Layout>
  );
};

export default App;
