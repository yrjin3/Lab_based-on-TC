"use client";

import React, { useState } from "react";
import { Button, Layout, Modal, Skeleton, message, Upload, UploadProps, Radio, RadioChangeEvent } from "antd";
import { DownloadOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Dragger } = Upload;

const startAt = "00:02:53.535"; // 00:00:00,000
const endAt = "00:02:53.535";

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <Layout className="min-h-screen">
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
        className="!bg-[#9abda5] flex items-center justify-end"
      >
        <Button onClick={showModal} className="!text-white" type="text" icon={<UploadOutlined />}>
          Upload
        </Button>
        <Button className="!text-white" type="text" icon={<DownloadOutlined />}>
          Download
        </Button>
      </Header>
      <Content className="px-[48px]">
        <div className="bg-white relative p-[24px] rounded-[10px] my-[16px] flex items-center gap-5">
          <div className="w-[100px]"></div>
          <div className="flex-1">원문</div>
          <div className="flex-1">번역문</div>
        </div>
        {new Array(30).fill(30).map((_, index) => {
          return (
            <div key={index} className="bg-white relative p-[24px] rounded-[10px] my-[16px] flex items-center gap-5">
              {/* <div className="absolute top-2 left-2 bg-[#9abda523] border px-3 py-1 text-[#9abda5] font-bold rounded-[10px] border-[#9abda5]">{index + 1}</div> */}
              <div className="w-[100px]">
                <div>{startAt}</div>
                <div>{endAt}</div>
              </div>
              <Skeleton className="flex-1" active />
              <Skeleton className="flex-1" active />
            </div>
          );
        })}
        {/* Modal */}
        <FileUploadModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      </Content>
      <Footer className="text-center"></Footer>
    </Layout>
  );
};

export default App;

const FileUploadModal = ({ isModalOpen, setIsModalOpen }: { isModalOpen: boolean; setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [originValue, setOriginValue] = useState(1);
  const [targetValue, setTargetValue] = useState(1);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<FileList>();

  const handleOk = () => {
    if (!file) {
      message.error("번역할 자막 파일을 선택해주세요.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
    }, 3000);
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
      setFile(e.dataTransfer.files);
    },
    beforeUpload(file, fileList) {
      const isStrOrVtt = file.type === "text/str" || file.type === "text/vtt";
      if (!isStrOrVtt) {
        message.error(`${file.name}은 srt 또는 vtt 확장자가 아닙니다.`);
      }
    },
  };

  return (
    <Modal
      maskClosable={true}
      title="번역할 자막 파일 업로드"
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={[
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          번역
        </Button>,
      ]}
    >
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">(SRT or VTT file only)</p>
      </Dragger>
      <div>
        <div className="flex flex-col gap-2 my-5">
          <span className="text-[16px] text-gray-500">원본 자막 언어</span>
          <Radio.Group
            onChange={(e: RadioChangeEvent) => {
              setOriginValue(e.target.value);
            }}
            value={originValue}
          >
            <Radio value={1}>Korean</Radio>
            <Radio value={2}>English</Radio>
            <Radio value={3}>Chinese (Simplified)</Radio>
            <Radio value={4}>Japanese</Radio>
          </Radio.Group>
          <span className="text-[16px] text-gray-500">번역할 언어</span>
          <Radio.Group
            onChange={(e: RadioChangeEvent) => {
              setTargetValue(e.target.value);
            }}
            value={targetValue}
          >
            <Radio value={1}>Korean</Radio>
            <Radio value={2}>English</Radio>
            <Radio value={3}>Chinese (Simplified)</Radio>
            <Radio value={4}>Japanese</Radio>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  );
};
