"use client";

import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { oAuthLogin } from "@workspace/ui/services/common/oauth";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

const icons = {
  apple: "uil:apple",
  google: "logos:google-icon",
  facebook: "logos:facebook",
  github: "uil:github",
  telegram: "logos:telegram",
};

export function OAuthMethods() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { oauth_methods } = common;
  const OAUTH_METHODS = oauth_methods?.filter(
    (method: string) => !["mobile", "email", "device"].includes(method)
  );
  return (
    OAUTH_METHODS?.length > 0 && (
      <>
        <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-slate-200 after:border-t dark:after:border-slate-800">
          <span className="relative z-10 bg-white px-3 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {t("oauth.or", "or")}
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {OAUTH_METHODS?.map((method: string) => (
            <Button
              className="h-11 w-full rounded-xl border border-slate-200 bg-white font-medium text-slate-700 text-sm shadow-none hover:bg-slate-50 lg:h-12 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              key={method}
              onClick={async () => {
                const { data } = await oAuthLogin({
                  method,
                  // OAuth providers disallow URL fragments (#) in redirect URIs.
                  // Use a real path (with trailing slash so static hosting can serve /oauth/<provider>/index.html)
                  // which then bridges into our hash-router at /#/oauth/<provider>.
                  redirect: `${window.location.origin}/oauth/${method}/`,
                });
                if (data.data?.redirect) {
                  window.location.href = data.data?.redirect;
                }
              }}
              type="button"
              variant="outline"
            >
              <Icon
                className="mr-2 size-4"
                icon={icons[method as keyof typeof icons]}
              />
              {t(`oauth.${method}`, `Continue with ${method}`)}
            </Button>
          ))}
        </div>
      </>
    )
  );
}
