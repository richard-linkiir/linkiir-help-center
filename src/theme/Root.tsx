import type {ReactNode} from 'react';
import ShipLogWidget from '@site/src/components/ShipLogWidget';

/**
 * Swizzled `@theme/Root` — the wrapper above the router, mounted once and not
 * re-created on navigation. The default implementation renders `children` and
 * nothing else; this adds the ShipLog feedback launcher alongside it so it
 * initialises a single time per visit rather than on every route change.
 *
 * Keep this component stateless apart from what its children need: anything
 * here runs on every page of the site, including 404s and the search page.
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <ShipLogWidget />
    </>
  );
}
