import type { ReactNode, ReactElement } from 'react';
import { I18nProvider } from '@lingui/react';
import {
  render as testingLibraryRender,
  type RenderOptions,
} from '@testing-library/react';
import { i18n } from './i18n';
import { messages } from './locales/en/messages.po';

i18n.load('en', messages);
i18n.activate('en');

function TestI18nProvider({ children }: { children: ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

export function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return testingLibraryRender(ui, { wrapper: TestI18nProvider, ...options });
}

export * from '@testing-library/react';
