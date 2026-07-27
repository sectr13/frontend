import { useTranslation } from "react-i18next";

const STEPS = [
  {
    n: "1",
    titleKey: "step1Title",
    descKey: "step1Desc",
    titleFallback: "Create account",
    descFallback: "Sign up with email or OAuth in under a minute.",
  },
  {
    n: "2",
    titleKey: "step2Title",
    descKey: "step2Desc",
    titleFallback: "Activate service",
    descFallback: "Pick a plan — monthly, quarterly, or annual.",
  },
  {
    n: "3",
    titleKey: "step3Title",
    descKey: "step3Desc",
    titleFallback: "Connect devices",
    descFallback: "Install the app on each device and sign in.",
  },
] as const;

export function HowItWorks() {
  const { t } = useTranslation("main");

  return (
    <section id="how">
      <h2 className="mb-7 text-center font-bold text-2xl text-slate-950 tracking-tight sm:mb-10 sm:text-[32px] dark:text-slate-50">
        {t("howItWorks", "How it works")}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((s) => (
          <div
            className="flex flex-col items-center gap-3 px-4 py-3 text-center sm:gap-4"
            key={s.n}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-orange-500 font-bold text-base text-white">
              {s.n}
            </div>
            <h3 className="font-semibold text-base text-slate-950 leading-snug sm:text-lg dark:text-slate-100">
              {t(s.titleKey, s.titleFallback)}
            </h3>
            <p className="max-w-[260px] text-slate-600 text-xs leading-relaxed sm:text-[13px] dark:text-slate-400">
              {t(s.descKey, s.descFallback)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
