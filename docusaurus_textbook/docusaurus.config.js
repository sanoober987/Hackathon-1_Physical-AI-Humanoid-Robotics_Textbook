import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Physical AI & Humanoid Robotics Academy",
  tagline: 'Mastering AI-Powered Robotics & Humanoid Systems',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://physicalhumanoidaitextbook.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'physical-ai-humanoid-robotics', // Usually your GitHub org/user name.
  projectName: 'physical-ai-humanoid-robotics-academy', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },


  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/physical-ai-humanoid-robotics/physical-ai-humanoid-robotics-academy/edit/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/physical-ai-humanoid-robotics/physical-ai-humanoid-robotics-academy/edit/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],


  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/ph-ai-logo.png',
      navbar: {
        title: "Physical AI & Humanoid Robotics Academy",
        logo: {
          alt: 'Physical AI & Humanoid Robotics Logo',
          src: 'img/ph-ai-logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Textbook',
          },
          {
            href: 'https://github.com/physical-ai-humanoid-robotics',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/introduction/intro',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Documentation',
                href: '/docs/introduction/intro',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/physical-ai-humanoid-robotics',
              },
              {
                label: 'Community',
                href: '/docs/introduction/intro',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/sanoober',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Academy, Developed with precision by Physical AI & Humanoid Robotics.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;