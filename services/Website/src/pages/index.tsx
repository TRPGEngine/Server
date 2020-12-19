import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import classnames from 'classnames';
import styles from './index.module.css';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

const features = [
  {
    title: '现代化',
    imageUrl: 'img/undraw_react.svg',
    description:
      '代码由现代流行的React打造，不管是开发与使用都能为你带来现代化的用户与体验',
  },
  {
    title: '高度活跃',
    imageUrl: 'img/undraw_operating_system.svg',
    description:
      '在过去的几年中，长久保持高活跃度的开发进行与产品迭代。争取为用户提供最好的体验',
  },
  {
    title: '拥抱开源',
    imageUrl: 'img/undraw_open_source.svg',
    description:
      'TRPG Engine拥抱开源与变化。你所看到的一切都是开放的！随时接受社区的监督',
  },
  {
    title: '便捷',
    imageUrl: 'img/undraw_note_list.svg',
    description:
      '走到哪，聊到哪。不论是车上，床上，食堂。都能保持与朋友的沟通不被中断',
  },
  {
    title: '即时沟通',
    imageUrl: 'img/undraw_youtube_tutorial.svg',
    description: '不论你在哪，都能和天南海北的伙伴一起享受跑团的乐趣',
  },
  {
    title: '记录历程',
    imageUrl: 'img/undraw_Personal_notebook_re_d7dc.svg',
    description: '优秀的跑团玩家会记录跑团中的一切，好记性不如烂笔头',
  },
  {
    title: '配置自定义',
    imageUrl: 'img/undraw_personal_settings_kihd.svg',
    description:
      'TRPG Engine提供了足够的自定义空间以供玩家来自定义自己的跑团空间',
  },
  {
    title: '高度可定制',
    imageUrl: 'img/undraw_code_review.svg',
    description:
      '创建自己的脚本，人物。 搭建自己独属于自己专属的团，或者用其他人现成的模板。你能想到的。我们都会为你提供！',
  },
  // {
  //   title: '更多特性',
  //   description: '易用, 简单, 便捷。 一直在试图为用户带来最好的跑团体验',
  // },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

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
          <Link
            className={classnames(
              'button button--outline button--primary button--lg',
              styles.homeButton
            )}
            to="https://trpg.moonrailgun.com/portal/deploy"
          >
            旧版移动端(兼容)
          </Link>

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
        <Tooltip placement="top" overlay={'猫爷TRPG'}>
          <a
            className={styles.relatedApp}
            href="https://maoyetrpg.com/"
            target="_blank"
            rel="noopener"
          >
            <img src="/img/others/maoyetrpg.jpg" />
          </a>
        </Tooltip>

        <Tooltip
          placement="top"
          overlay={
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
        </Tooltip>

        <Tooltip placement="top" overlay={'脑洞: 超有趣的创作社交平台'}>
          <a
            className={styles.relatedApp}
            href="https://www.naodong.fun"
            target="_blank"
            rel="noopener"
          >
            <img src="/img/others/naodong.png" />
          </a>
        </Tooltip>
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
          {features && features.length && (
            <section className={styles.features}>
              <div className="container">
                <div className="row" style={{ justifyContent: 'center' }}>
                  {features.map((props, idx) => (
                    <Feature key={idx} {...props} />
                  ))}
                </div>
              </div>
            </section>
          )}

          <SimpleDice />

          <ChromeDownload />

          <RelatedApps />
        </main>
      </div>
    </Layout>
  );
}

export default Index;
