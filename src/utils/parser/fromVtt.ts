import { Subtitle } from "@/types/subtitle.type";

export const fromVtt = (content: string): Subtitle[] => {
  const arr = content.replaceAll(" align:center", "").split("\n\n");
  const result = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].length > 0) {
      const [id, time, ...text] = arr[i].split("\n");
      const [startTime, endTime] = time.split(" --> ");
      let allText = "";
      if (text.length > 0) {
        text.map((r) => {
          allText += r;
        });
      }
      result.push({ id, startTime, endTime, text: allText });
    }
  }
  return result;
};
