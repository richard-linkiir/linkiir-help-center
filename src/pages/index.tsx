import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type QuickLink = {label: string; to: string};

const QUICK_LINKS: QuickLink[] = [
  {label: 'Install on Windows', to: '/docs/administration/installation/windows'},
  {label: 'Install on macOS', to: '/docs/administration/installation/macos'},
  {
    label: 'Recover a lost administrator password',
    to: '/docs/getting-started/first-login',
  },
  {
    label: 'Receive HL7 v2 over MLLP',
    to: '/docs/interface-development/interfaces/source-nodes',
  },
  {
    label: 'Connect to Epic, Cerner, Salesforce, S3, or Slack',
    to: '/docs/adapters/',
  },
  {
    label: 'Look up a Lua function',
    to: '/docs/api/scripting-api',
  },
  {
    label: 'Understand High Availability and pick a topology',
    to: '/docs/high-availability/',
  },
  {
    label: 'Move a project between environments',
    to: '/docs/administration/deployment/import-export',
  },
  {
    label: 'Connect your own Kafka or Redpanda',
    to: '/docs/administration/configurations/kafka-redpanda',
  },
  {
    label: 'Find out why messages are not arriving',
    to: '/docs/administration/troubleshooting/',
  },
  {
    label: 'Open a support ticket',
    to: '/docs/support/standard-support',
  },
  {
    label: 'Report a critical production outage',
    to: '/docs/support/urgent-production-support',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  // Deliberately no `hero--dark`: Infima's modifier paints a slate background
  // over the theme's dot-grid and clashes with the black page background.
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Linkiir Help Center
        </Heading>
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
          {siteConfig.tagline}
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg lnk-btn-shimmer"
            to="/docs/getting-started/">
            Get Started →
          </Link>
          <Link className="button button--outline button--lg" to="/docs/">
            Browse the Documentation →
          </Link>
        </div>
      </div>
    </header>
  );
}

// Jira Service Management customer portal. Kept here as a constant so the
// navbar entry in docusaurus.config.ts and this band stay easy to keep in sync.
const SUPPORT_PORTAL_URL =
  'https://linkiir.atlassian.net/servicedesk/customer/portals';

function SupportBand() {
  return (
    <section className={styles.supportSection}>
      <div className="container">
        <div className={styles.supportPanel}>
          <div className={styles.supportCopy}>
            <p className="lnk-eyebrow">Need help?</p>
            <Heading as="h2" className={styles.supportTitle}>
              Open a support ticket
            </Heading>
            <p className={styles.supportBody}>
              Submit a request in the Linkiir support portal, or email{' '}
              <a href="mailto:support@linkiir.com">support@linkiir.com</a>. For a
              critical production outage, call the 24/7 support number issued to
              your organisation.
            </p>
          </div>
          <div className={styles.supportActions}>
            <Link
              className="button button--primary button--lg lnk-btn-shimmer"
              href={SUPPORT_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer">
              Submit a Support Ticket →
            </Link>
            <Link
              className="button button--outline button--lg"
              to="/docs/support/">
              Support Options →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  return (
    <section className={styles.quickSection}>
      <div className="container">
        <p className="lnk-eyebrow">Common tasks</p>
        <ul className={styles.quickGrid}>
          {QUICK_LINKS.map(({label, to}) => (
            <li key={to} className={styles.quickItem}>
              <Link to={to} className={styles.quickLink}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Documentation for building, deploying, and operating healthcare interfaces on Linkiir.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <SupportBand />
        <QuickLinks />
      </main>
    </Layout>
  );
}
