import { getTranslations } from 'next-intl/server';

// NOTE: this content is a generic placeholder draft, not reviewed by a
// lawyer. Have it reviewed by qualified legal counsel before relying on
// it for a real deployment -- see the `termsSection*` strings in
// messages/en.json and messages/zh-Hant-HK.json.
const SECTION_COUNT = 9;

export default async function TermsPage() {
  const t = await getTranslations();

  return (
    <main className="w-full flex justify-center p-6 md:p-10">
      <article
        className="w-full max-w-3xl flex flex-col gap-6"
        data-cy="terms-content"
      >
        <div>
          <h1 className="text-2xl font-bold">{t('termsTitle')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('termsLastUpdated')}
          </p>
        </div>
        <p>{t('termsIntro')}</p>
        {Array.from({ length: SECTION_COUNT }, (_, index) => {
          const sectionNumber = index + 1;
          return (
            <section key={sectionNumber} className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">
                {t(`termsSection${sectionNumber}Title`)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(`termsSection${sectionNumber}Body`)}
              </p>
            </section>
          );
        })}
      </article>
    </main>
  );
}
