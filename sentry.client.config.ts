import * as Sentry from '@sentry/nextjs';
import { ExtraErrorData } from '@sentry/integrations';
import { settingsSchema, cleanseErrorData } from '@runtipi/shared';

const getClientConfig = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const inputElement = document.getElementById('client-settings') as HTMLInputElement | null;

  if (!inputElement) {
    return {};
  }

  const parsedSettings = settingsSchema.parse(JSON.parse(inputElement.value));

  return parsedSettings;
};

const { allowErrorMonitoring } = getClientConfig();

if (allowErrorMonitoring && process.env.NODE_ENV === 'production') {
  Sentry.init({
    release: process.env.NEXT_PUBLIC_TIPI_VERSION,
    environment: process.env.NODE_ENV,
    dsn: 'https://7a73d72f886948478b55621e7b92c3c7@o4504242900238336.ingest.sentry.io/4504826587971584',
    beforeSend: cleanseErrorData,
    integrations: [new ExtraErrorData()],
    initialScope: {
      tags: { version: process.env.TIPI_VERSION },
    },
  });
}
