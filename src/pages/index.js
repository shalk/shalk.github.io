import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './index.module.css'
import HomepageFeatures from '../components/HomepageFeatures'
import Head from '@docusaurus/Head'
import HeroImg from '../../static/img/Hero.jpg'

const svgList = [
]
const Svg = ({ Svg, color, title, link }) => {
  return (
    <a href={link} target='_blank'>
      <Svg className={styles.svg} style={{ fill: color }} />
    </a>
  )
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <h1 className='hero__title'>{siteConfig.title}</h1>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className='button button--secondary button--lg' to='/docs/intro'>
            🖱Click Here!
          </Link>
        </div>
      </div>
    </header>
  )
}

function MyHero() {
  return (
    <div className={styles.myHeroContainer}>
      <div className={styles.leftContainer}>
        <h1 className={styles.leftContainer_h1}>
          月光照在路上
	  <br/>
	  像是撒满了盐
        </h1>
        <p className={styles.leftContainer_p}>
	    余华  活着
          <br />
          在这里记录知识，希望对你也有帮助。
        </p>
        <div className={styles.buttonContainer}>
         <div className={styles.svgContainer}>
            {svgList.map((item, index) => {
              return <Svg {...item} key={item.title} />
            })}
          </div>
	   <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/wiki-intro">
            Start Wiki ⏱️
          </Link>
          </div>
        </div>
      </div>
      <div className={styles.rightContainer}>
        <img src={HeroImg} alt='HeroImg' />
      </div>
    </div>
  )
}
export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      // title={`${siteConfig.title}`}
      title='Home'
      description='Wiki知识库/vscode/javascript/软件/工具'>
      {/* <HomepageHeader /> */}
      <Head>
      // 百度
      // <meta name="baidu-site-verification" content="code-7VeTrprZVx" />
      // 360
      // <meta name="360-site-verification" content="0b0e3331bbf6d4f5bf369201bb326123" />
      // Bing
      // <meta name="msvalidate.01" content="5723E6B938F5EE2738E056F2A58E1DB7" />
      // 搜狗
      // <meta name="sogou_site_verification" content="ZwDQxSe70Y" />
      // 神马
      // <meta name="shenma-site-verification" content="fed71b373d433c21d139f454bd1409b4_1663059054"></meta>
      // 头条
      // <meta name="bytedance-verification-code" content="G6kAPFmjdnZWEKwOqHzU" />
      // Google
      // <meta name="google-site-verification" content="_rHzOjHo4rSNNcdH1Pyby6bwPqXCZWZ4qWPXRGj11kw" />
      </Head>
      <main>
        <MyHero />
        {/* <HomepageFeatures /> */}
      </main>
    </Layout>
  )
}
