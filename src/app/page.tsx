"use client";

import React, { useEffect, useState } from "react";
import { Button, Layout, Modal, Skeleton, message, Upload, UploadProps, Radio, RadioChangeEvent, Tag, UploadFile, FloatButton } from "antd";
import { ArrowUpOutlined, DownloadOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { fromVtt } from "@/utils/parser/fromVtt";
import { fromSrt } from "@/utils/parser/fromSrt";
import { Subtitle } from "@/types/subtitle.type";
import Lottie from "lottie-react";
import LoadingAnimation from "./../../public/lottie/loading.json";
import axios from "axios";

const { Header, Content, Footer } = Layout;
const { Dragger } = Upload;

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>(); // upload file list
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [result, setResult] = useState<Subtitle[]>([]);
  const [resultLoading, setResultLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const [originValue, setOriginValue] = useState("ko");
  const [targetValue, setTargetValue] = useState("ko");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const onTranslation = () => {
    if (!fileList.length) return;
    // 원문
    const file = fileList[0];
    setResultLoading(true);

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
    data.append("source_language_code", originValue);
    data.append("target_language_code", targetValue);
    data.append("file", file.originFileObj);
    data.append("options", "{}");

    let config = {
      method: "post",
      url: "/translate-subtitle",
      headers: {
        "Content-Type": "multipart/form-data",
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY,
      },
      data,
    };

    axios
      .request(config)
      .then((response) => {
        const resultURL = response.data.result;
        setDownloadUrl(`${resultURL}?x-api-key=${process.env.NEXT_PUBLIC_X_API_KEY}`);
        axios.get(`${resultURL}?x-api-key=${process.env.NEXT_PUBLIC_X_API_KEY}`).then((res) => {
          const { data } = res;

          if (file.name.endsWith(".srt")) {
            setResult(fromSrt(data));
          } else {
            setResult(fromVtt(data));
          }

          setResultLoading(false);
        });
      })
      .catch((error) => {
        console.log(error);
        setResultLoading(false);
      });
  };

  return (
    <Layout className="min-h-screen">
      {resultLoading && (
        <>
          <div className="fixed w-[500px] top-1/2 z-10 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <Lottie animationData={LoadingAnimation} loop />
          </div>
          <div className="bg-[#0000002e] w-screen h-screen fixed z-10" />
        </>
      )}
      <Header className="!bg-[#fff] flex items-center justify-between shadow-sm sticky top-0 z-[1] w-full">
        <a href="/" className="flex text-lg font-semibold items-center gap-3">
          <div className="bg-[#9abda5] p-2 rounded-full">
            <svg id="Layer_1" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
              <path
                fill="#fff"
                d="m15 12a1 1 0 0 1 -1 1h-1v4.5a2.5 2.5 0 1 1 -2.5-2.5 2.577 2.577 0 0 1 .5.05v-2.05a2 2 0 0 1 2-2h1a1 1 0 0 1 1 1zm7-1.515v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515a6.955 6.955 0 0 1 4.95 2.051l3.484 3.484a6.955 6.955 0 0 1 2.051 4.95zm-6.949-7.02a4.989 4.989 0 0 0 -1.051-.781v4.316a1 1 0 0 0 1 1h4.316a4.989 4.989 0 0 0 -.781-1.051zm4.949 7.02c0-.165-.032-.323-.047-.485h-4.953a3 3 0 0 1 -3-3v-4.953c-.162-.015-.32-.047-.485-.047h-4.515a3 3 0 0 0 -3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3z"
              />
            </svg>
          </div>
          자막번역
        </a>
        <div className="flex gap-3">
          <Button onClick={showModal} icon={<UploadOutlined />} loading={resultLoading}>
            {resultLoading ? "번역중" : "업로드"}
          </Button>
          <Button href={downloadUrl} icon={<DownloadOutlined />} disabled={result.length === 0}>
            다운로드
          </Button>
        </div>
      </Header>
      <Content className="px-[48px]">
        {subtitles.length === 0 && <div className="bg-transparent mt-4 h-screen h- w-full" />}
        {subtitles.length > 0 && (
          <>
            <div className="bg-[#9abda5] text-white text-[14px] font-medium relative px-[24px] py-[10px] rounded-[10px] my-[16px] flex items-center gap-5 shadow-sm">
              <div className="w-[128px]">타임코드</div>
              <div className="flex-1">원문</div>
              <div className="flex-1">번역문</div>
            </div>
            <>
              {subtitles.map(({ id, startTime, endTime, text }, index) => {
                return (
                  <div key={index} className="bg-white relative px-[20px] py-[8px] rounded-r-[10px] my-[8px] shadow-sm border-l-[4px] border-[#9abda5]">
                    <div className="text-[#9abda5] text-[16px] font-bold mb-[6px]">{id}</div>
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
                        {resultLoading ? (
                          <>
                            <Skeleton.Input active={true} size={"small"} className="!h-[18px]" />
                            <Skeleton.Input active={true} size={"small"} block className="!h-[18px]" />
                          </>
                        ) : (
                          <>{result[index].text}</>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          </>
        )}
        <FloatButton
          type="primary"
          icon={<ArrowUpOutlined />}
          onClick={() => {
            if (window !== undefined) {
              window.scrollTo(0, 0);
            }
          }}
        />
        {/* Modal */}
        <FileUploadModal
          fileList={fileList}
          setFileList={setFileList}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onTranslation={onTranslation}
          originValue={originValue}
          setOriginValue={setOriginValue}
          targetValue={targetValue}
          setTargetValue={setTargetValue}
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
  targetValue: string;
  originValue: string;
  setOriginValue: React.Dispatch<React.SetStateAction<string>>;
  setTargetValue: React.Dispatch<React.SetStateAction<string>>;
};

const FileUploadModal = ({
  fileList,
  setFileList,
  isModalOpen,
  setIsModalOpen,
  onTranslation,
  targetValue,
  originValue,
  setOriginValue,
  setTargetValue,
}: Props) => {
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
