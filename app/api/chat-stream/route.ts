import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";
import { requestOpenai } from "../common";
import { incrementIpCount } from "@/lib/count";

async function createStream(req: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  //===============================
  // const shuffleArray = (arr: string[]) => {
  //   return arr.sort(() => Math.random() - 0.5);
  // }
  // const key = process.env.OPENAI_API_KEY?.split(',') || []
  // const keys = process.env.OPENAI_API_KEYS?.split(',') || []; // 包含多个api_key的数组
  // const api_keys = keys
  // console.log(api_keys,req)
  // let current_key_index = 0; // 当前使用的api_key的索引
  // let res: any = {}
  // let flag = false

  // while (current_key_index < api_keys.length) {
  //   req.headers.set("token", api_keys[current_key_index]);
  //   res = await requestOpenai(req);
  //   const contentType = res.headers.get("Content-Type") ?? "";
  //   if (contentType.includes("stream")) {
  //     // 在这里处理流数据
  //     console.log('111============================', req.headers.get("token"))
  //     flag = true
  //     break; // 如果已经得到流数据，就跳出循环
  //   } else {
  //     // 如果还没有得到流数据，就继续使用下一个api_key
  //     console.log('222============================', req.headers.get("token"))
  //     current_key_index++;
  //   }
  // }
  // if(!flag){
  //   return "**维护公告：**\n\n我们正在申请OpenAI的企业账户，同时正在对接新的功能，以及修复一些web问题，所以在此期间访问会出现不稳定，比如出现此条消息，预计维护时间是`2023.4.27-2023.5.3`，请耐心等待恢复正常！\n\nchatgptnext@gmail.com\n2023.4.27";
  // }

  //============================================================
  const res = await requestOpenai(req);

  const contentType = res.headers.get("Content-Type") ?? "";

  if (!contentType.includes("stream")) {
    // const content = await (
    //   await res.text()
    // ).replace(/provided:.*. You/, "provided: ***. You");
    //console.log("[Stream] error ", content);
    //return "```json\n" + content + "```";
    return "访问`Open AI`接口人太多了，请喝口水，稍会儿再试...";
    //return "**维护公告：**\n\n我们正在申请OpenAI的企业账户，同时正在对接新的功能，以及修复一些web问题，所以在此期间访问会出现不稳定，比如出现此条消息，预计维护时间是`2023.4.27-2023.5.3`，请耐心等待恢复正常！\n\nchatgptnext@gmail.com\n2023.4.27";
  }

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk, { stream: true }));
      }
    },
  });
  return stream;
}

export async function POST(req: NextRequest) {
  try {
    const stream = await createStream(req);
    const ip = req.headers.get("ip");
    if (ip) {
      incrementIpCount(ip);
    }
    return new Response(stream);
  } catch (error) {
    console.error("[Chat Stream]", error);
    return new Response(
      "访问`Open AI`接口人太多了，请喝口水，稍会儿再试...",
      //["```json\n", JSON.stringify(error, null, "  "), "\n```"].join(""),
    );
  }
}

export const runtime = "edge";
