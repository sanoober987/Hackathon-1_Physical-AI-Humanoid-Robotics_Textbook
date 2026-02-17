import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug/',
    component: ComponentCreator('/__docusaurus/debug/', '546'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config/',
    component: ComponentCreator('/__docusaurus/debug/config/', '8a8'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content/',
    component: ComponentCreator('/__docusaurus/debug/content/', '2da'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData/',
    component: ComponentCreator('/__docusaurus/debug/globalData/', '178'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata/',
    component: ComponentCreator('/__docusaurus/debug/metadata/', 'd6c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry/',
    component: ComponentCreator('/__docusaurus/debug/registry/', '6e3'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes/',
    component: ComponentCreator('/__docusaurus/debug/routes/', 'cab'),
    exact: true
  },
  {
    path: '/docs/',
    component: ComponentCreator('/docs/', 'c06'),
    routes: [
      {
        path: '/docs/',
        component: ComponentCreator('/docs/', '763'),
        routes: [
          {
            path: '/docs/',
            component: ComponentCreator('/docs/', '3f7'),
            routes: [
              {
                path: '/docs/advanced-ai-control/module-5-advanced-ai/',
                component: ComponentCreator('/docs/advanced-ai-control/module-5-advanced-ai/', 'd65'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/appendix/glossary/',
                component: ComponentCreator('/docs/appendix/glossary/', '206'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/appendix/references/',
                component: ComponentCreator('/docs/appendix/references/', '5e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/appendix/resources/',
                component: ComponentCreator('/docs/appendix/resources/', 'fe9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/hardware-basics/module-3-hardware/',
                component: ComponentCreator('/docs/hardware-basics/module-3-hardware/', '0ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/humanoid-design/module-6-humanoid-design/',
                component: ComponentCreator('/docs/humanoid-design/module-6-humanoid-design/', '9da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro/',
                component: ComponentCreator('/docs/intro/', 'e44'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/introduction/intro/',
                component: ComponentCreator('/docs/introduction/intro/', 'aa4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/ros2-foundations/module-1-ros2/',
                component: ComponentCreator('/docs/ros2-foundations/module-1-ros2/', '36e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/ros2-foundations/ros2-hands-on/',
                component: ComponentCreator('/docs/ros2-foundations/ros2-hands-on/', 'a2d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/simulation/digital-twins/',
                component: ComponentCreator('/docs/simulation/digital-twins/', 'e8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/simulation/gazebo-unity/',
                component: ComponentCreator('/docs/simulation/gazebo-unity/', 'ef5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/simulation/module-2-simulation/',
                component: ComponentCreator('/docs/simulation/module-2-simulation/', 'ca2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/vla-systems/module-4-vla-foundations/',
                component: ComponentCreator('/docs/vla-systems/module-4-vla-foundations/', '858'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/vla-systems/vla-action/',
                component: ComponentCreator('/docs/vla-systems/vla-action/', '5da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/vla-systems/vla-hands-on-basic/',
                component: ComponentCreator('/docs/vla-systems/vla-hands-on-basic/', 'b24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/vla-systems/vla-language/',
                component: ComponentCreator('/docs/vla-systems/vla-language/', 'd38'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/vla-systems/vla-vision/',
                component: ComponentCreator('/docs/vla-systems/vla-vision/', '64e'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
