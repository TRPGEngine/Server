import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import classnames from 'classnames';
import styles from './index.module.css';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import { Features } from '../components/Features';
import { InfoTooltip } from '../components/InfoTooltip';

function HomeSplash(props) {
  const { siteConfig, language = '' } = props;
  const { baseUrl, docsUrl } = siteConfig;
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
  const langPart = `${language ? `${language}/` : ''}`;
  const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

  return (
    <header className={classnames('hero', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={classnames(
              'button button--outline button--primary button--lg',
              styles.homeButton
            )}
            to="https://trpg.moonrailgun.com"
          >
            立即体验
          </Link>

          {/* <Button href={useBaseUrl('/download')}>下载桌面版</Button> */}

          {/* <Link
            className={classnames(
              'button button--outline button--primary button--lg',
              styles.homeButton
            )}
            to="https://trpg.moonrailgun.com/portal/deploy"
          >
            旧版移动端(兼容)
          </Link> */}

          <Link
            className={classnames(
              'button button--primary button--lg',
              styles.homeButton
            )}
            to="https://trpg.moonrailgun.com/portal/trpg/recruit/list"
          >
            自由招募
          </Link>
        </div>
      </div>
    </header>
  );
}

function SimpleDice() {
  return (
    <div className={styles.simpleSection}>
      <h2>Simple Dice</h2>
      <p>不想注册新账号? 只想要一个骰子？</p>
      <p>主持人自己投骰玩家不服？想要让别人为自己的大成功喊666？</p>
      <p>TRPG Engine 专门提供了一个极简在线投骰工具</p>
      <div>
        <a
          href="https://dice.moonrailgun.com/"
          target="_blank"
          className="button button--lg button--primary"
        >
          快来试一试!
        </a>
      </div>
    </div>
  );
}

function ChromeDownload() {
  return (
    <div className={styles.simpleSection}>
      <div>
        <img src="/img/chrome-logo.svg" width="96" height="96" />
      </div>
      <h2>下载 Chrome 浏览器</h2>
      <p>
        <strong>TRPG Engine</strong>{' '}
        使用了许多新的浏览器特性，强烈推荐使用地上最强浏览器Chrome以获得最佳的浏览体验
      </p>
      <div>
        <a
          href="https://www.google.cn/chrome/"
          target="_blank"
          className="button button--lg button--primary button--outline"
        >
          下载Chrome
        </a>
      </div>
    </div>
  );
}

const RelatedApps: React.FC = () => {
  return (
    <div className={styles.simpleSection}>
      <h2>不止于TRPG Engine</h2>
      <p>同样拥有很多优秀的跑团相关App, 同样也可以尝试一下。</p>
      <p>适合的，才是最好的</p>
      <div>
        <InfoTooltip text={'猫爷TRPG'}>
          <a
            className={styles.relatedApp}
            href="https://maoyetrpg.com/"
            target="_blank"
            rel="noopener"
          >
            <img src="/img/others/maoyetrpg.jpg" />
          </a>
        </InfoTooltip>

        <InfoTooltip
          text={
            <>
              <div>活字引擎: 数千用户选择的超好用跑团Replay制作器</div>
              <div>自动配音，把对话记录做成Replay视频只要十分钟</div>
              <div>下载交流群：1132302303</div>
            </>
          }
        >
          <a
            className={styles.relatedApp}
            href="https://weibo.com/6505580910/J5fKndecW?type=comment"
            target="_blank"
            rel="noopener"
          >
            <img src="/img/others/hzyq.jpg" />
          </a>
        </InfoTooltip>

        <InfoTooltip text={'脑洞: 超有趣的创作社交平台'}>
          <a
            className={styles.relatedApp}
            href="https://www.naodong.fun"
            target="_blank"
            rel="noopener"
          >
            <img src="/img/others/naodong.png" />
          </a>
        </InfoTooltip>

        <InfoTooltip
          text={'魔都创建于2008年，是地球上第一家收集并提供纯中文模组的网站。'}
        >
          <a
            className={styles.relatedApp}
            href="https://www.cnmods.net/"
            target="_blank"
            rel="noopener"
          >
            <img src="/img/others/cnmods.jpg" />
          </a>
        </InfoTooltip>

        <InfoTooltip text={'深渊小屋'}>
          <a
            className={styles.relatedApp}
            href="https://deepwood.wang/"
            target="_blank"
            rel="noopener"
          >
            <img src="/img/others/syxw.png" />
          </a>
        </InfoTooltip>
      </div>
    </div>
  );
};

function Index() {
  const context = useDocusaurusContext();
  const { siteConfig } = context;
  const { baseUrl, language, tagline, customFields } = siteConfig;

  return (
    <Layout>
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <main>
          <Features />

          <SimpleDice />

          <ChromeDownload />

          <RelatedApps />
        </main>
      </div>
    </Layout>
  );
}

export default Index;
