import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import i18n from '../i18n';
import { CapacityWarning } from './CapacityWarning';

describe('CapacityWarning', () => {
  beforeEach(async () => { await i18n.changeLanguage('en'); });

  it('shows usage at the 75% threshold', () => {
    render(<CapacityWarning resource="cards" capacity={{ used: 36, limit: 48 }} />);
    expect(screen.getByRole('status').textContent).toBe('Card capacity: 36/48');
  });

  it('does not show usage below the threshold', () => {
    render(<CapacityWarning resource="cards" capacity={{ used: 35, limit: 48 }} />);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
