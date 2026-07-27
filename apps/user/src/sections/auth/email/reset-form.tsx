import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Icon } from "@workspace/ui/composed/icon";
import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useGlobalStore } from "@/stores/global";
import SendCode from "../send-code";
import type { TurnstileRef } from "../turnstile";
import CloudFlareTurnstile from "../turnstile";

export default function ResetForm({
  loading,
  onSubmit,
  initialValues,
  setInitialValues,
  onSwitchForm,
}: {
  loading?: boolean;
  onSubmit: (data: any) => void;
  initialValues: any;
  setInitialValues: Dispatch<SetStateAction<any>>;
  onSwitchForm: Dispatch<SetStateAction<"register" | "reset" | "login">>;
}) {
  const { t } = useTranslation("auth");

  const { common } = useGlobalStore();
  const { verify, auth } = common;

  const formSchema = z.object({
    email: z
      .string()
      .email(t("reset.email", "Please enter a valid email address")),
    password: z.string(),
    code: auth?.email?.enable_verify ? z.string() : z.string().nullish(),
    cf_token:
      verify.enable_reset_password_verify && verify.turnstile_site_key
        ? z.string()
        : z.string().nullish(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const turnstile = useRef<TurnstileRef>(null);
  const handleSubmit = form.handleSubmit((data) => {
    try {
      onSubmit(data);
    } catch (_error) {
      turnstile.current?.reset();
    }
  });

  return (
    <>
      <Form {...form}>
        <form className="grid gap-4 lg:gap-3" onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-11 rounded-xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 lg:h-12 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={t("placeholders.email", "Enter your email...")}
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      className="h-11 rounded-xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 lg:h-12 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                      disabled={loading}
                      placeholder={t("placeholders.code", "Enter code...")}
                      type="text"
                      {...field}
                      value={field.value as string}
                    />
                    <SendCode
                      params={{
                        email: form.watch("email"),
                        type: 2,
                      }}
                      type="email"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-11 rounded-xl border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 lg:h-12 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={t(
                      "placeholders.newPassword",
                      "Enter your new password..."
                    )}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {verify.enable_reset_password_verify && (
            <FormField
              control={form.control}
              name="cf_token"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CloudFlareTurnstile
                      id="reset"
                      {...field}
                      ref={turnstile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button
            className="h-11 rounded-xl bg-orange-500 font-semibold text-white shadow-none hover:bg-orange-600 active:bg-orange-700 lg:h-12 dark:bg-orange-500 dark:hover:bg-orange-600"
            disabled={loading}
            type="submit"
          >
            {loading && <Icon className="animate-spin" icon="mdi:loading" />}
            {t("reset.title", "Reset Password")}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-right text-slate-500 text-xs dark:text-slate-400">
        {t("reset.existingAccount", "Remember your password?")}&nbsp;
        <Button
          className="h-auto p-0 font-medium text-orange-600 text-xs hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          onClick={() => {
            setInitialValues(undefined);
            onSwitchForm("login");
          }}
          variant="link"
        >
          {t("reset.switchToLogin", "Login")}
        </Button>
      </div>
    </>
  );
}
