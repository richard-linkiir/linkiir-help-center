import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  linkiirSidebar: [
    'index',
    {
      type: 'category', label: 'Getting Started', link: {type: 'doc', id: 'getting-started/index'},
      items: [
        'getting-started/platform-overview',
        'getting-started/quick-install',
        'getting-started/first-login',
        'getting-started/demo-project',
      ],
    },
    {
      type: 'category', label: 'Administration', link: {type: 'doc', id: 'administration/index'},
      items: [
        {type: 'category', label: 'Installation', link: {type: 'doc', id: 'administration/installation/index'}, items: [
          'administration/installation/windows', 'administration/installation/linux', 'administration/installation/macos',
        ]},
        {type: 'category', label: 'Licensing', link: {type: 'doc', id: 'administration/licensing/index'}, items: [
          'administration/licensing/license-types', 'administration/licensing/license-id-code',
          'administration/licensing/capacity-and-expiry', 'administration/licensing/license-transfer',
        ]},
        {type: 'category', label: 'Upgrades', link: {type: 'doc', id: 'administration/upgrades/index'}, items: [
          'administration/upgrades/windows', 'administration/upgrades/linux', 'administration/upgrades/macos',
        ]},
        {type: 'category', label: 'Deployment', link: {type: 'doc', id: 'administration/deployment/index'}, items: [
          'administration/deployment/dev', 'administration/deployment/test', 'administration/deployment/prod',
          'administration/deployment/ha', 'administration/deployment/import-export',
        ]},
        {type: 'category', label: 'Configurations', link: {type: 'doc', id: 'administration/configurations/index'}, items: [
          'administration/configurations/project-settings', 'administration/configurations/user-roles',
          'administration/configurations/migration',
          'administration/configurations/http-server',
          'administration/configurations/log-archive-database', 'administration/configurations/kafka-redpanda',
        ]},
        'administration/backup-restore/index',
        {type: 'category', label: 'Alerting and Notifications', link: {type: 'doc', id: 'administration/notifications/index'}, items: [
          'administration/notifications/settings',
        ]},
        'administration/security/index',
        {type: 'category', label: 'Troubleshooting', link: {type: 'doc', id: 'administration/troubleshooting/index'}, items: [
          'administration/troubleshooting/runtime-crash', 'administration/troubleshooting/crash-report',
          'administration/troubleshooting/log-archiver-connectivity',
        ]},
      ],
    },
    {
      type: 'category', label: 'Interface Development', link: {type: 'doc', id: 'interface-development/index'},
      items: [
        'interface-development/architecture',
        {type: 'category', label: 'Interfaces and Core Nodes', link: {type: 'doc', id: 'interface-development/interfaces/index'}, items: [
          'interface-development/interfaces/source-nodes', 'interface-development/interfaces/destination-nodes',
          'interface-development/interfaces/custom-scripting-nodes',
        ]},
        {type: 'category', label: 'Sample Code', link: {type: 'doc', id: 'interface-development/sample-code/index'}, items: [
          'interface-development/sample-code/http-source-demo', 'interface-development/sample-code/hl7-llp-scripting-llp',
        ]},
        {type: 'category', label: 'Lua Programming', link: {type: 'doc', id: 'interface-development/lua-programming/index'}, items: [
          'interface-development/lua-programming/testing-debugging',
          'interface-development/lua-programming/code-sets',
        ]},
        'interface-development/error-handling',
      ],
    },
    {
      type: 'category', label: 'Adapters', link: {type: 'doc', id: 'adapters/index'},
      items: [
        'adapters/how-adapters-work',
        'adapters/epic',
        'adapters/cerner',
        'adapters/ecw',
        'adapters/modmed',
        'adapters/athena',
        'adapters/salesforce',
        'adapters/dynamics-365',
        'adapters/aws-s3',
        'adapters/slack',
        'adapters/azure-openai',
        'adapters/fhir-resource-creator',
        'adapters/fhir-profiling-tools',
      ],
    },
    {
      type: 'category', label: 'Catalogs', link: {type: 'doc', id: 'catalogs/index'},
      items: [
        'catalogs/subscribing',
        'catalogs/using-catalog-content',
        'catalogs/publishing',
        'catalogs/offline-delivery',
      ],
    },
    {
      type: 'category', label: 'High Availability', link: {type: 'doc', id: 'high-availability/index'},
      items: [
        'high-availability/terminology',
        'high-availability/licensing',
        'high-availability/architecture',
        'high-availability/system-requirements',
        'high-availability/topologies',
        'high-availability/backup-and-disaster-recovery',
        'high-availability/planning-your-deployment',
        'high-availability/ha-settings',
        'high-availability/operations',
      ],
    },
    {
      type: 'category', label: 'API', link: {type: 'doc', id: 'api/index'},
      items: [
        {
          type: 'category', label: 'Linkiir Scripting API', link: {type: 'doc', id: 'api/scripting-api/index'},
          items: [
            'api/scripting-api/script-globals',
            'api/scripting-api/message-data',
            'api/scripting-api/message-flow',
            'api/scripting-api/connectivity',
            'api/scripting-api/database',
            'api/scripting-api/byte-transforms',
            'api/scripting-api/json',
            'api/scripting-api/security',
            'api/scripting-api/runtime-system',
            'api/scripting-api/logging',
            'api/scripting-api/node-configuration',
            'api/scripting-api/lua-table-library',
            'api/scripting-api/lua-math-library',
            'api/scripting-api/lua-os-library',
            'api/scripting-api/lua-io-library',
            'api/scripting-api/lua-string-library',
            'api/scripting-api/lua-debug-library',
          ],
        },
        {
          type: 'category', label: 'Web API', link: {type: 'doc', id: 'api/web-api/linkiir-api'},
          // The generated array's own first item duplicates this category's `link`
          // (both point at the intro doc) — drop it, or Next/Prev pagination loops
          // the intro page back to itself.
          items: require('./docs/api/web-api/sidebar.ts').slice(1),
        },
      ],
    },
    {
      type: 'category', label: 'FAQ', link: {type: 'doc', id: 'faq/index'},
      items: ['faq/common-questions', 'faq/tips-best-practices'],
    },
    {
      type: 'category', label: 'Support', link: {type: 'doc', id: 'support/index'},
      items: [
        'support/standard-support',
        'support/urgent-production-support',
        'support/submitting-a-request',
        'support/phi-policy',
      ],
    },
    {
      type: 'category', label: 'Release Notes', link: {type: 'doc', id: 'release-notes/index'},
      items: [
        'release-notes/unreleased',
        'release-notes/linkiir-grid-v1.0.0',
      ],
    },
  ],
};

export default sidebars;
