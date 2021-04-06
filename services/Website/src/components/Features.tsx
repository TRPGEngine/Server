import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import classNames from 'classnames';
import styles from './Features.module.css';

const features = [
  {
    title: '现代化',
    imageUrl: 'img/undraw_react.svg',
    description:
      '代码由现代流行的 React 打造，不管是开发与使用都能为你带来现代化的用户与体验',
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
      'TRPG Engine 拥抱开源与变化。你所看到的一切都是开放的！随时接受社区的监督',
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
      'TRPG Engine 提供了足够的自定义空间以供玩家来自定义自己的跑团空间',
  },
  {
    title: '高度可定制',
    imageUrl: 'img/undraw_code_review.svg',
    description:
      '创建自己的脚本，人物。 搭建自己独属于自己专属的团，或者用其他人现成的模板。你能想到的。我们都会为你提供！',
  },
  {
    title: '聊天机器人',
    imageUrl: 'img/undraw_Chat_bot_re_e2gj.svg',
    description: '支持多种方式的机器人接入。通过机器人来拓展你的跑团平台！',
  },
  // {
  //   title: '更多特性',
  //   description: '易用, 简单, 便捷。 一直在试图为用户带来最好的跑团体验',
  // },
];

function FeatureItem({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classNames('col col--4', styles.feature)}>
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

export const Features = React.memo(() => {
  return (
    features &&
    features.length && (
      <section className={styles.features}>
        <div className="container">
          <div className="row" style={{ justifyContent: 'center' }}>
            {features.map((props, idx) => (
              <FeatureItem key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    )
  );
});
