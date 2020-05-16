import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import classnames from 'classnames';
import styles from './index.module.css';

const features = [
  {
    title: '现代化',
    imageUrl: 'img/undraw_react.svg',
    description:
      '代码由现代流行的React打造，不管是开发与使用都能为你带来现代化的用户与开发体验',
  },
  {
    title: '高度活跃',
    imageUrl: 'img/undraw_operating_system.svg',
    description:
      '在过去的几年中，长久保持高活跃度的开发进行与产品迭代。争取为用户提供最好的体验',
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
    title: '高度可定制',
    imageUrl: 'img/undraw_code_review.svg',
    description:
      '创建自己的脚本，人物。 搭建自己专属的团。你能想到的。我们都会为你提供！',
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
              'button button--outline button--primary button--lg margin-right--sm',
              styles.getStarted
            )}
            to="https://trpg.moonrailgun.com"
          >
            网页版
          </Link>
          {/* <Button href={useBaseUrl('/download')}>下载桌面版</Button> */}
          <Link
            className={classnames(
              'button button--outline button--primary button--lg',
              styles.getStarted
            )}
            to="https://trpg.moonrailgun.com/portal/deploy"
          >
            下载移动版
          </Link>
        </div>
      </div>
    </header>
  );
}

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
        </main>
      </div>
    </Layout>
  );
}

export default Index;
