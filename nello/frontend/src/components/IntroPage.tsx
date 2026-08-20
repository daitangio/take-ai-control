import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

interface IntroPageProps {
  onSignIn: () => void;
  onRegister: () => void;
}

const FEATURE_KEYS = ['multilingual', 'sharedBoards', 'feature3', 'feature4'] as const;

export function IntroPage({ onSignIn, onRegister }: IntroPageProps) {
  const { t } = useTranslation();

  return (
    <div className="intro-page">
      <header className="intro-header">
        <div className="intro-brand" aria-label="Nello">
          <span className="intro-brand-mark">N</span>
          <span>Nello</span>
        </div>
        <LanguageSelector />
      </header>

      <main className="intro-main">
        <section className="intro-hero" aria-labelledby="intro-title">
          <div className="intro-copy">
            <p className="intro-eyebrow">{t('intro.eyebrow')}</p>
            <h1 id="intro-title">{t('intro.title')}</h1>
            <p className="intro-description">{t('intro.description')}</p>
            <div className="intro-actions">
              <button className="intro-primary-action" type="button" onClick={onSignIn}>
                {t('intro.signIn')}
              </button>
              <button className="intro-secondary-action" type="button" onClick={onRegister}>
                {t('intro.register')}
              </button>
            </div>
            <p className="intro-note">{t('intro.note')}</p>
          </div>

          <div className="intro-preview" aria-label={t('intro.previewAria')}>
            <div className="intro-preview-topbar">
              <span className="intro-preview-dot" />
              <span className="intro-preview-dot" />
              <span className="intro-preview-dot" />
              <span className="intro-preview-title">{t('app.title')}</span>
            </div>
            <div className="intro-preview-board">
              <div className="intro-preview-column">
                <span>{t('intro.previewColumnTodo')}</span>
                <div className="intro-preview-card intro-preview-card--blue">{t('intro.previewCard')}</div>
                <div className="intro-preview-card" />
              </div>
              <div className="intro-preview-column">
                <span>{t('intro.previewColumnDoing')}</span>
                <div className="intro-preview-card intro-preview-card--yellow" />
              </div>
              <div className="intro-preview-column">
                <span>{t('intro.previewColumnDone')}</span>
                <div className="intro-preview-card intro-preview-card--green" />
              </div>
            </div>
          </div>
        </section>

        <section className="intro-features" aria-labelledby="intro-features-title">
          <div className="intro-section-heading">
            <p className="intro-eyebrow">{t('intro.featuresEyebrow')}</p>
            <h2 id="intro-features-title">{t('intro.featuresHeading')}</h2>
          </div>
          <div className="intro-feature-grid">
            {FEATURE_KEYS.map((featureKey, index) => (
              <article className="intro-feature" key={featureKey}>
                <span className="intro-feature-number">0{index + 1}</span>
                <h3>{t(`intro.features.${featureKey}.title`)}</h3>
                <p>{t(`intro.features.${featureKey}.description`)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="intro-footer">{t('intro.footer')}</footer>
    </div>
  );
}
