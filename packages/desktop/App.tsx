import React, { FC } from 'react';

import { Provider } from '@onekeyhq/kit';
import '@onekeyhq/shared/src/web/index.css';

const App: FC = function () {
  return (
    <>
      <div
        style={{
          zIndex: 2,
          position: 'fixed',
          width: '100%',
          height: 28,
          top: 0,
          // @ts-expect-error
          WebkitAppRegion: 'drag',
          WebkitUserSelect: 'none',
          // pointerEvents: 'none',
          // '-webkit-app-region': 'drag',
          // '-webkit-user-select': 'none',
          // 'pointer-events': 'none',
        }}
        onDoubleClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          window?.desktopApi?.toggleMaximizeWindow();
        }}
      />
      <Provider />
    </>
  );
};

export default App;
