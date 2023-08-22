import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "./app/config/server";
import md5 from "spark-md5";
import { getIpCount } from "./lib/count"

export const config = {
  matcher: ["/api/openai", "/api/chat-stream"],
};

const serverConfig = getServerSideConfig();

// function getIP(req: NextRequest) {
//   let ip = req.ip ?? req.headers.get("x-real-ip");
//   const forwardedFor = req.headers.get("x-forwarded-for");

//   if (!ip && forwardedFor) {
//     ip = forwardedFor.split(",").at(0) ?? "";
//   }

//   return ip;
// }


export async function middleware(req: NextRequest) {

  const localCount = req.headers.get("totalLimitCount") || '0';
  const totalDayCount = req.headers.get("totalDayCount") || '0';
  const referer = req.headers.get("referer") || ""
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const ip = req.headers.get('ip') || ''

  //数据库记录
  const count = await getIpCount(ip)
  const isHost = referer.indexOf("gptnext.top") > -1 || referer.indexOf("chatnext.top") > -1 || referer.indexOf("gitpod.io") > -1


  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", ip);
  console.log("[Time] ", new Date().toLocaleString());
  console.log(count.userCount, localCount, count.vipCount, totalDayCount)

  
  const isNoRight = serverConfig.needCode && !serverConfig.codes.has(hashedCode) && !token

  // if(!ip){
  //   return NextResponse.json(
  //     {
  //       error: true,
  //       needAccessCode: true,
  //       msg: "Please go settings page and fill your access code.",
  //     },
  //     {
  //       status: 403,
  //     },
  //   );
  // }

  if (((count.userCount > 6 || parseInt(localCount) > 8) && isNoRight) || !isHost) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      },
    );
  }


  //vip每天次数限制
  if (count.vipCount > 65 || parseInt(totalDayCount) > 70) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Request exceeded the specified number of times, please try again tomorrow.",
      },
      {
        status: 402,
      },
    );
  }


  // inject api key
  if (!token) {
    const apiKey = serverConfig.apiKey;
    if (apiKey) {
      console.log("[Auth] set system token");
      req.headers.set("token", apiKey);
    } else {
      return NextResponse.json(
        {
          error: true,
          msg: "Empty Api Key",
        },
        {
          status: 401,
        },
      );
    }
  } else {
    console.log("[Auth] set user token");
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}
