import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  to: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Getting Started',
    to: '/docs/getting-started/',
    Svg: require('@site/static/img/feat-getting-started.svg').default,
    description: (
      <>
        Four steps from a downloaded package to a live HTTP endpoint you can
        call with <code>curl</code>. About 20 minutes on a local machine.
      </>
    ),
  },
  {
    title: 'Interface Development',
    to: '/docs/interface-development/',
    Svg: require('@site/static/img/feat-interface-development.svg').default,
    description: (
      <>
        Source, Transform, and Destination nodes with every configuration
        field, Lua scripting, worked samples, and error handling.
      </>
    ),
  },
  {
    title: 'Adapters',
    to: '/docs/adapters/',
    Svg: require('@site/static/img/feat-adapters.svg').default,
    description: (
      <>
        Prebuilt connectors for EHR, CRM, medical device, cloud storage,
        messaging, and AI systems. Configured with fields, not code.
      </>
    ),
  },
  {
    title: 'Administration',
    to: '/docs/administration/',
    Svg: require('@site/static/img/feat-administration.svg').default,
    description: (
      <>
        Installation, licensing, upgrades, deployment environments,
        configuration, backups, security, and troubleshooting.
      </>
    ),
  },
  {
    title: 'High Availability',
    to: '/docs/high-availability/',
    Svg: require('@site/static/img/feat-high-availability.svg').default,
    description: (
      <>
        Active/standby pairs, the five supported topologies, system
        requirements, and how HA differs from backup and disaster recovery.
      </>
    ),
  },
  {
    title: 'FAQ',
    to: '/docs/faq/',
    Svg: require('@site/static/img/feat-faq.svg').default,
    description: (
      <>
        Broker and Log Archive Database choices, licensing limits, and the
        operating practices worth adopting early.
      </>
    ),
  },
  {
    title: 'Support',
    to: '/docs/support/',
    Svg: require('@site/static/img/feat-support.svg').default,
    description: (
      <>
        Open a ticket by email or the support portal, what to expect in your
        inbox, and the 24/7 urgent production support policy.
      </>
    ),
  },
];

function Feature({title, to, Svg, description}: FeatureItem) {
  return (
    <Link to={to} className={clsx('lnk-card', styles.featureCard)}>
      {/* Decorative: the card title carries the meaning. */}
      <Svg className={styles.featureIcon} aria-hidden="true" />
      <Heading as="h3" className={clsx('lnk-card__title', styles.featureTitle)}>
        {title}
      </Heading>
      <p className={clsx('lnk-card__body', styles.featureBody)}>{description}</p>
      <span className={styles.featureMore}>Open →</span>
    </Link>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <p className="lnk-eyebrow">Documentation areas</p>
        <div className={styles.featureGrid}>
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
