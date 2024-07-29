"use client";

import React, { useEffect, useState } from "react";
import { Button, Layout, Modal, Skeleton, message, Upload, UploadProps, Radio, RadioChangeEvent, Tag, UploadFile } from "antd";
import { DownloadOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { fromVtt } from "@/utils/parser/fromVtt";
import { fromSrt } from "@/utils/parser/fromSrt";
import { Subtitle } from "@/types/subtitle.type";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Dragger } = Upload;

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>(); // upload file list
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [result, setResult] = useState<Subtitle[]>([]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const onTranslation = () => {
    if (!fileList.length) return;
    // 원문
    const file = fileList[0];

    let reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        let parsedSubtitles: Subtitle[];
        if (file.name.endsWith(".srt")) {
          parsedSubtitles = fromSrt(content);
        } else {
          parsedSubtitles = fromVtt(content);
        }

        setSubtitles(parsedSubtitles);
      } catch (err) {
        console.error(err);
      }
    };

    if (file.originFileObj) {
      reader.readAsText(file.originFileObj);
    }

    // 번역문
    let data = new FormData();
    data.append("source_language_code", "ko");
    data.append("target_language_code", "en");
    data.append("file", file.originFileObj);
    data.append("options", "{}");

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.dev.letr.ai/translate-subtitle",
      headers: {
        "x-api-key": "LETRHRCFLQFBD8I7HZNVR2O6VJI1EH6293ZJ",
        // ...data.getHeaders()
      },
      data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
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
        className="!bg-[#9abda5] flex items-center justify-end shadow-sm"
      >
        <Button onClick={showModal} className="!text-white" type="text" icon={<UploadOutlined />}>
          Upload
        </Button>
        <Button className="!text-white" type="text" icon={<DownloadOutlined />}>
          Download
        </Button>
      </Header>
      <Content className="px-[48px]">
        <div className="bg-white relative px-[24px] py-[10px] rounded-[10px] my-[16px] flex items-center gap-5 shadow-sm">
          <div className="w-[128px]"></div>
          <div className="flex-1">원문</div>
          <div className="flex-1">번역문</div>
        </div>
        {subtitles.length === 0 &&
          new Array(5).fill("").map((_, index) => {
            return (
              <div key={index} className="bg-white relative p-[24px] rounded-[10px] my-[16px] flex items-center gap-5">
                <div className="w-[128px]">
                  <div>{}</div>
                  <div>{}</div>
                </div>
                <div className="flex-1 min-h-[120px]" />
                <div className="flex-1 min-h-[120px]" />
              </div>
            );
          })}
        {subtitles.length > 0 &&
          subtitles.map(({ id, startTime, endTime, text }, index) => {
            return (
              <div key={index} className="bg-white relative px-[20px] py-[16px] rounded-r-[10px] my-[8px] shadow-sm border-l-[4px] border-[#9abda5]">
                <div className="text-[#9abda5] text-xl font-bold mb-[6px]">{id}</div>
                <div className="flex items-start gap-5">
                  <div className="w-[128px] flex flex-col">
                    <div className="grid grid-rows-2 gap-y-1 text-[12px]" style={{ gridTemplateColumns: "auto auto" }}>
                      <Tag className="w-fit" bordered={false} color="gold">
                        start
                      </Tag>
                      <div className="items-center flex text-gray-500">{`${startTime}`.replace(",", ".")}</div>
                      <Tag className="w-fit" bordered={false} color="gold">
                        end
                      </Tag>
                      <div className="items-center flex text-gray-500">{`${endTime}`.replace(",", ".")}</div>
                    </div>
                  </div>
                  <div className="flex-1">{text}</div>
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton.Input active={true} size={"small"} className="!h-[18px]" />
                    <Skeleton.Input active={true} size={"small"} block className="!h-[18px]" />
                  </div>
                </div>
              </div>
            );
          })}
        {/* Modal */}
        <FileUploadModal
          fileList={fileList}
          setFileList={setFileList}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onTranslation={onTranslation}
        />
      </Content>
      <Footer className="text-center"></Footer>
    </Layout>
  );
};

export default App;

type Props = {
  fileList: UploadFile<any>[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onTranslation: () => void;
};

const FileUploadModal = ({ fileList, setFileList, isModalOpen, setIsModalOpen, onTranslation }: Props) => {
  const [originValue, setOriginValue] = useState("ko");
  const [targetValue, setTargetValue] = useState("ko");

  const handleOk = () => {
    if (!fileList) {
      message.error("번역할 자막 파일을 선택해주세요.");
      return;
    }
    onTranslation();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) setFileList(undefined);
  }, [isModalOpen]);

  const props: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".srt,.vtt",
    fileList: fileList,
    onRemove() {
      setFileList(undefined);
    },
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} 파일 업로드를 성공했습니다.`);
        setFileList(info.fileList);
      } else if (status === "error") {
        message.error(`${info.file.name} 파일 업로드에 실패했습니다.`);
      }
    },
    onDrop(e) {
      const fileList = e.dataTransfer.files;
      const isSrtOrVtt = fileList[0].name.endsWith(".srt") || fileList[0].name.endsWith(".vtt");

      if (!isSrtOrVtt) {
        message.error(`${fileList[0].name}은 srt 또는 vtt 확장자가 아닙니다.`);
        return Upload.LIST_IGNORE;
      }
    },
    beforeUpload(file, fileList) {
      const isSrtOrVtt = file.name.endsWith(".srt") || file.name.endsWith(".vtt");
      if (!isSrtOrVtt) {
        message.error(`${file.name}은 srt 또는 vtt 확장자가 아닙니다.`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  return (
    <Modal
      maskClosable={true}
      title="번역할 자막 파일 업로드"
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk}>
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
        <div className="flex flex-col gap-5 mt-7">
          <div className="flex flex-col gap-2">
            <Tag className="w-fit" bordered={false} color="processing">
              원본 자막 언어
            </Tag>
            <Radio.Group
              onChange={(e: RadioChangeEvent) => {
                setOriginValue(e.target.value);
              }}
              value={originValue}
            >
              <Radio value={"ko"}>Korean</Radio>
              <Radio value={"en"}>English</Radio>
              <Radio value={"zh-CN"}>Chinese (Simplified)</Radio>
              <Radio value={"ja"}>Japanese</Radio>
            </Radio.Group>
          </div>
          <div className="flex flex-col gap-2">
            <Tag className="w-fit" bordered={false} color="processing">
              번역할 언어
            </Tag>
            <Radio.Group
              onChange={(e: RadioChangeEvent) => {
                setTargetValue(e.target.value);
              }}
              value={targetValue}
            >
              <Radio value={"ko"}>Korean</Radio>
              <Radio value={"en"}>English</Radio>
              <Radio value={"zh-CN"}>Chinese (Simplified)</Radio>
              <Radio value={"ja"}>Japanese</Radio>
            </Radio.Group>
          </div>
        </div>
      </div>
    </Modal>
  );
};
