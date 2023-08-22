import { useEffect, useRef } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import Movie from "../icons/movie.svg";
import PluginIcon from "../icons/plugin.svg";
import TelegramIcon from "../icons/telegram.svg";
import IssueIcon from "../icons/issue.svg";
import { showModal } from "./ui-lib";
import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showToast } from "./ui-lib";

function openMovieModal() {
  showModal({
    title: "使用方法演示",
    children: (
      <div>
        <video className="youtube" controls muted>
          <source
            src="https://gytblog.oss-cn-shenzhen.aliyuncs.com/chatnext.mp4"
            type="video/mp4"
          />
          您的浏览器不支持 video 视频标签
        </video>
      </div>
    ),
    actions: [],
  });
}

function openInssueModal() {
  showModal({
    title: "公告",
    children: (
      <div className="markdown-body issue-book">
        <div className="issue-content">
          近期，AIGC的火热程度不言而喻。网站建立初衷是为了方便大家学习和研究。我们日常的运营与维护需要花费极大的
          <strong>精力和成本</strong>
          ，包括服务器、梯子、购买token等，大概上千刀/月的维护成本。为了让网站持续运行下去，因此开通了友情赞助。只要您赞助了就可以一直使用它，每天请求额度由承载能力动态控制，非常感谢已有的十来位同学的赞助，我们会尽最大的努力，让网站更好的运行！
          经过一段时间的运行，有几个问题：
        </div>
        <ul className="issue-content-ul">
          <li>
            拥有访问码的同学切忌传播，目前是要求<strong>一人一码</strong>
            ，如果发现对应IP烂用访问码，我们会直接<strong>封禁IP</strong>
            和访问码的访问。
          </li>
          <li>
            目前平台不打算作为盈利，遵从<strong>自由赞助</strong>
            ，如果不愿赞助也有免费使用的额度，欢迎大家尝试。
          </li>
          <li>
            当出现访问峰值时，而导致API无法承载出现卡顿时，请大家遇到这个情况请
            <strong>稍后再试</strong>
            ，我们一直关注着网站的运行情况。
          </li>
        </ul>
        <div>
          <strong>重要通知：</strong>
          <ul className="issue-content-ul">
            <li>
              我们正在努力对接4.0，若对接成功，4.0上线前的赞助用户可以
              <strong>免费</strong>
              使用，支持我们就赞助我们吧！同时，也即将对接上线各种有用的AI工具。
            </li>
            <li>
              由于域名可能被墙，保险起见加入我们Telegram群组(需魔法)。或者保存我们的邮箱，后续能与我们取得联系chatgptnext@gmail.com。
            </li>
          </ul>
        </div>
        {/* <div className="issue-footer">2023年04年15日</div> */}
        {/* <div className="issue-footer">chatgptnext@gmail.com</div> */}
        <hr />
        <div>
          <strong>免责申明</strong>
          ：本平台仅供个人学习、学术研究使用，未经许可，请勿分享、传播输入及生成的文本、图片内容，禁止询问违反国家规定的问题，所产生的法律责任自行负责。倡导大家文明、合法使用，切勿违反国家法律！
        </div>
      </div>
    ),
    actions: [],
  });
}

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();

  const config = useAppConfig();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>
          ChatGPT 3.5
          <div className={styles["sidebar-title-version"]}>Latest</div>
        </div>
        <div className={styles["sidebar-sub-title"]}>
          提供免梯直连gpt，4.0即将上线.
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<MaskIcon />}
          text={shouldNarrow ? undefined : Locale.Mask.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => navigate(Path.NewChat, { state: { fromHome: true } })}
          shadow
        />
        <IconButton
          icon={<Movie />}
          text="演示"
          className={styles["sidebar-bar-button"]}
          onClick={() => {
            openMovieModal();
          }}
          shadow
        />
        <IconButton
          icon={<PluginIcon />}
          text={shouldNarrow ? undefined : Locale.Plugin.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => showToast(Locale.WIP)}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["join-telegram"]}>
        <IconButton
          icon={<TelegramIcon />}
          text="加入Telegram群组，防丢失"
          className={styles["icon-button"]}
          onClick={() => {
            window.open("https://t.me/+J8x74qZhkh9mYzdl");
          }}
        />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={chatStore.deleteSession}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} text="设置" shadow />
            </Link>
          </div>
          <div className={styles["sidebar-action"]}>
            <IconButton
              icon={<IssueIcon />}
              text="公告"
              shadow
              title={Locale.Chat.Actions.Export}
              onClick={() => {
                openInssueModal();
              }}
            />
            {/* <a href={REPO_URL} target="_blank">
              <IconButton icon={<GithubIcon />} shadow />
            </a> */}
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      ></div>
    </div>
  );
}
