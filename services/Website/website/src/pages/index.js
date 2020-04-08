import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Image from '@theme/IdealImage';
import Layout from '@theme/Layout';
import MDXComponents from '@theme/MDXComponents';

const MarkdownBlock = MDXComponents; /* Used to read markdown */
const Container = (props) => <div>{props.children}</div>;
const GridBlock = (props) => <div>{props.children}</div>;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = '' } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = (props) => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = (props) => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = (props) => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = (props) => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/undraw_chatting_2yvo.svg`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href="https://trpg.moonrailgun.com">网页版</Button>
            {/* <Button href="/download">下载桌面版</Button> */}
            <Button href="https://trpg.moonrailgun.com/portal/deploy">
              下载移动版
            </Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

function Index() {
  const context = useDocusaurusContext();
  const { siteConfig } = context;
  const { baseUrl, languag, tagline, customFields } = siteConfig;

  const Block = (props) => (
    <div
      padding={['bottom', 'top']}
      id={props.id}
      background={props.background}
    >
      <GridBlock
        align="center"
        contents={props.children}
        layout={props.layout}
      />
    </div>
  );

  const FeatureCallout = () => (
    <div
      className="productShowcaseSection paddingBottom"
      style={{ textAlign: 'center' }}
    >
      <h2>更多特性</h2>
      <MarkdownBlock>
        `易用`,`简单`,`便捷`. 一直在试图为用户带来最好的跑团体验
      </MarkdownBlock>
    </div>
  );

  const TryOut = () => (
    <Block id="try">
      {[
        {
          title: '高度可定制',
          content:
            '创建自己的脚本，人物。 搭建自己专属的团。你能想到的。我们都会为你提供！',
          image: `${baseUrl}img/undraw_code_review.svg`,
          imageAlign: 'left',
        },
      ]}
    </Block>
  );

  const Description = () => (
    <Block background="dark">
      {[
        {
          title: '便捷',
          content:
            '走到哪，聊到哪。不论是车上，床上，食堂。都能保持与朋友的沟通不被中断',
          image: `${baseUrl}img/undraw_note_list.svg`,
          imageAlign: 'right',
        },
      ]}
    </Block>
  );

  const LearnHow = () => (
    <Block background="light">
      {[
        {
          title: '即时沟通',
          content: '不论你在哪，都能和天南海北的伙伴一起享受跑团的乐趣.',
          image: `${baseUrl}img/undraw_youtube_tutorial.svg`,
          imageAlign: 'right',
        },
      ]}
    </Block>
  );

  // 特性
  const Features = () => (
    <Block layout="fourColumn">
      {[
        {
          title: '现代化',
          content:
            '代码由现代流行的React打造，不管是开发与使用都能为你带来现代化的用户与开发体验',
          image: `${baseUrl}img/undraw_react.svg`,
          imageAlign: 'top',
        },
        {
          title: '高度活跃',
          content:
            '在过去的几年中，长久保持高活跃度的开发进行与产品迭代。争取为用户提供最好的体验',
          image: `${baseUrl}img/undraw_operating_system.svg`,
          imageAlign: 'top',
        },
      ]}
    </Block>
  );

  const Showcase = () => {
    if ((siteConfig.users || []).length === 0) {
      return null;
    }

    const showcase = siteConfig.users
      .filter((user) => user.pinned)
      .map((user) => (
        <a href={user.infoLink} key={user.infoLink}>
          <img src={user.image} alt={user.caption} title={user.caption} />
        </a>
      ));

    const pageUrl = (page) => baseUrl + (language ? `${language}/` : '') + page;

    return (
      <div className="productShowcaseSection paddingBottom">
        <h2>谁在使用?</h2>
        <p>这个项目正在被这些人使用</p>
        <div className="logos">{showcase}</div>
        <div className="more-users">
          <a className="button" href={pageUrl('users.html')}>
            更多 {siteConfig.title} 用户
          </a>
        </div>
      </div>
    );
  };

  return (
    <Layout
      permalink="/"
      title={tagline}
      description={customFields.description}
    >
      <main>
        <div>
          <div>
            <h1>
              <img
                alt="Docusaurus with Keytar"
                src={useBaseUrl('img/docusaurus_keytar.svg')}
              />
              Build <span>optimized</span> websites <span>quickly</span>, focus
              on your <span>content</span>
            </h1>
            <div>
              <Link to={useBaseUrl('docs/introduction')}>Get Started</Link>
              <span>
                <iframe
                  src="https://ghbtns.com/github-btn.html?user=facebook&amp;repo=docusaurus&amp;type=star&amp;count=true&amp;size=large"
                  width={160}
                  height={30}
                  title="GitHub Stars"
                />
              </span>
            </div>
          </div>
        </div>
        <div
          className={classnames(styles.announcement, styles.announcementDark)}
        >
          <div>
            Coming from v1? Check out our{' '}
            <Link to={useBaseUrl('/docs/migrating-from-v1-to-v2')}>
              v1 to v2 migration guide
            </Link>
            .
          </div>
        </div>
        <div>
          <div className="container text--center margin-bottom--xl">
            <div className="row">
              <div className="col">
                <img
                  alt="Powered by MDX"
                  src={useBaseUrl('img/undraw_typewriter.svg')}
                />
                <h2 className={classnames(styles.featureHeading)}>
                  Powered by Markdown
                </h2>
                <p className="padding-horiz--md">
                  Save time and focus on your project's documentation. Simply
                  write docs and blog posts with Markdown/MDX and Docusaurus
                  will publish a set of static HTML files ready to serve. You
                  can even embed JSX components into your Markdown thanks to
                  MDX.
                </p>
              </div>
              <div className="col">
                <img
                  alt="Built Using React"
                  src={useBaseUrl('img/undraw_react.svg')}
                />
                <h2 className={classnames(styles.featureHeading)}>
                  Built Using React
                </h2>
                <p className="padding-horiz--md">
                  Extend or customize your project's layout by reusing React.
                  Docusaurus can be extended while reusing the same header and
                  footer.
                </p>
              </div>
              <div className="col">
                <img
                  alt="Ready for Translations"
                  src={useBaseUrl('img/undraw_around_the_world.svg')}
                />
                <h2 className={classnames(styles.featureHeading)}>
                  Ready for Translations
                </h2>
                <p className="padding-horiz--md">
                  Localization comes pre-configured. Use Crowdin to translate
                  your docs into over 70 languages.
                </p>
              </div>
            </div>
          </div>
          <div className="container text--center">
            <div className="row">
              <div className="col col--4 col--offset-2">
                <img
                  alt="Document Versioning"
                  src={useBaseUrl('img/undraw_version_control.svg')}
                />
                <h2 className={classnames(styles.featureHeading)}>
                  Document Versioning
                </h2>
                <p className="padding-horiz--md">
                  Support users on all versions of your project. Document
                  versioning helps you keep documentation in sync with project
                  releases.
                </p>
              </div>
              <div className="col col--4">
                <img
                  alt="Document Search"
                  src={useBaseUrl('img/undraw_algolia.svg')}
                />
                <h2 className={classnames(styles.featureHeading)}>
                  Content Search
                </h2>
                <p className="padding-horiz--md">
                  Make it easy for your community to find what they need in your
                  documentation. We proudly support Algolia documentation
                  search.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={classnames(styles.section, styles.sectionAlt)}>
          <div className="container">
            <div className="row">
              {QUOTES.map((quote) => (
                <div className="col" key={quote.name}>
                  <div className="avatar avatar--vertical margin-bottom--sm">
                    <Image
                      alt={quote.name}
                      className="avatar__photo avatar__photo--xl"
                      img={quote.thumbnail}
                      style={{ overflow: 'hidden' }}
                    />
                    <div className="avatar__intro padding-top--sm">
                      <h4 className="avatar__name">{quote.name}</h4>
                      <small className="avatar__subtitle">{quote.title}</small>
                    </div>
                  </div>
                  <p className="text--center text--italic padding-horiz--md">
                    {quote.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );

  return (
    <Layout>
      <div>
        {/* <HomeSplash siteConfig={siteConfig} language={language} /> */}
        <div className="mainContainer">
          {/* <Features />
          <FeatureCallout />
          <LearnHow />
          <TryOut />
          <Description />
          <Showcase /> */}
        </div>
      </div>
    </Layout>
  );
}

export default Index;
