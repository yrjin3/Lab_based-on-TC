import { Subtitle } from "@/types/subtitle.type";

export const fromSrt = (content: string): Subtitle[] => {
  const arr = content.split("\n\n");
  const result = [];
  for (let i = 0; i < arr.length; i++) {
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
