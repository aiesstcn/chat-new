interface QueryStringParams {
  [key: string]: string | undefined;
}

export default function getRefUrl(): string {
  const params: QueryStringParams = {};

  const queryString = window.location.search.slice(1);

  queryString.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    params[decodeURIComponent(key)] = value
      ? decodeURIComponent(value)
      : undefined;
  });

  const id = params?.id;
  //return "https://mbd.pub/o/bread/ZJuTl5ds";
  return "https://bs.aiesst.cn/7158.html";
  //return "https://bs.aiesst.cn/7158.html";
  // if (id === "AI") {
  //   return "https://bs.aiesst.cn/6927.html";
  // } else {
  //   return "https://bs.aiesst.cn/6910.html";
  // }
  // const isGptNext = location.host.indexOf("gptnext.top") > -1;

  // if (isGptNext) {
  //   if (id === "0") {
  //     return "https://bs.aiesst.cn/6938.html";
  //   } else {
  //     return "https://bs.aiesst.cn/6940.html";
  //   }
  // } else {
  //   if (id === "AI") {
  //     return "https://bs.aiesst.cn/6927.html";
  //   } else if (id === "ai") {
  //     return "https://bs.aiesst.cn/7015.html";
  //   } else {
  //     return "https://bs.aiesst.cn/6910.html";
  //   }
  // }
}
