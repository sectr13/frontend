"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ProList } from "@workspace/ui/composed/pro-list/pro-list";
import {
  queryUserAffiliate,
  queryUserAffiliateList,
} from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { isBrowser } from "@workspace/ui/utils/index";
import { useTranslation } from "react-i18next";
import { CopyButton } from "@/components/copy-button";
import { Display } from "@/components/display";
import { EmptyState } from "@/components/empty-state";
import { useGlobalStore } from "@/stores/global";

export default function Affiliate() {
  const { t } = useTranslation("affiliate");
  const { user, common } = useGlobalStore();
  const { data } = useQuery({
    queryKey: ["queryUserAffiliate"],
    queryFn: async () => {
      const response = await queryUserAffiliate();
      return response.data.data;
    },
  });

  const inviteLink = `${isBrowser() ? location?.origin : ""}/#/auth?invite=${user?.refer_code}`;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("totalCommission", "Total Commission")}</CardTitle>
          <CardDescription>
            {t("commissionInfo", "Commission Info")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-3xl">
              <Display type="currency" value={data?.total_commission} />
            </span>
            <span className="text-muted-foreground text-sm">
              ({t("commissionRate", "Commission Rate")}:{" "}
              {user?.referral_percentage || common?.invite?.referral_percentage}
              %)
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="font-medium text-lg">
            {t("inviteCode", "Invite Code")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <code className="rounded bg-muted px-2 py-1 font-bold text-2xl">
              {user?.refer_code}
            </code>
            <CopyButton
              copiedLabel={t("copySuccess", "Copied!")}
              copyLabel={t("copyInviteLink", "Copy Invite Link")}
              text={inviteLink}
              variant="secondary"
            />
          </div>
        </CardContent>
      </Card>
      <ProList<API.UserAffiliate, Record<string, unknown>>
        empty={
          <EmptyState
            description={t(
              "noReferralsDesc",
              "Share your invite link to earn commission."
            )}
            icon="uil:users-alt"
            title={t("noReferrals", "No referrals yet")}
          />
        }
        header={{
          title: t("inviteRecords", "Invite Records"),
        }}
        renderItem={(item) => (
          <Card className="overflow-hidden">
            <CardContent className="p-3 text-sm">
              <ul className="grid grid-cols-2 gap-3 *:flex *:flex-col">
                <li className="font-semibold">
                  <span className="text-muted-foreground">
                    {t("userIdentifier", "User Identifier")}
                  </span>
                  <span>{item.identifier}</span>
                </li>
                <li className="font-semibold">
                  <span className="text-muted-foreground">
                    {t("registrationTime", "Registration Time")}
                  </span>
                  <time>{formatDate(item.registered_at)}</time>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
        request={async (pagination, filter) => {
          const response = await queryUserAffiliateList({
            ...pagination,
            ...filter,
          });
          return {
            list: response.data.data?.list || [],
            total: response.data.data?.total || 0,
          };
        }}
      />
    </div>
  );
}
