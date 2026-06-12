import { useTranslation } from "react-i18next";

export interface NavItem {
  title: string;
  url: string;
  icon: string;
}

export interface NavGroup {
  title: string;
  url?: string;
  icon?: string;
  items?: NavItem[];
}

export function useNavs() {
  const { t } = useTranslation("components");

  const navs: NavGroup[] = [
    {
      title: t("menu.dashboard", "Dashboard"),
      url: "/dashboard",
      icon: "uil:dashboard",
    },
    {
      title: t("menu.services", "My Services"),
      items: [
        {
          url: "/subscribe",
          icon: "uil:network-chart",
          title: t("menu.network", "Network"),
        },
        {
          url: "/amraanet",
          icon: "uil:wifi",
          title: t("menu.amraanet", "AmraaNet"),
        },
      ],
    },
    {
      title: t("menu.account", "Account"),
      items: [
        {
          title: t("menu.profile", "Profile"),
          url: "/profile",
          icon: "uil:user-circle",
        },
        {
          url: "/order",
          icon: "uil:receipt",
          title: t("menu.order", "Orders"),
        },
        {
          url: "/wallet",
          icon: "uil:wallet",
          title: t("menu.wallet", "Wallet"),
        },
        {
          url: "/affiliate",
          icon: "uil:users-alt",
          title: t("menu.affiliate", "Referral"),
        },
      ],
    },
    {
      title: t("menu.help", "Help"),
      items: [
        {
          url: "/document",
          icon: "uil:book-open",
          title: t("menu.document", "Guides"),
        },
        {
          url: "/announcement",
          icon: "uil:bell",
          title: t("menu.announcement", "Updates"),
        },
        {
          url: "/ticket",
          icon: "uil:headphones",
          title: t("menu.ticket", "Support"),
        },
      ],
    },
  ];

  return navs;
}

export function useFindNavByUrl(url: string) {
  const navs = useNavs();

  for (const nav of navs) {
    if (nav.url && nav.url === url) {
      return [nav];
    }
    if (nav.items) {
      const current = nav.items.find((item) => item.url === url);
      if (current) {
        return [nav, current];
      }
    }
  }
  return [];
}

export function useNavItems() {
  const { t } = useTranslation("components");

  return [
    {
      url: "/profile",
      icon: "uil:user-circle",
      title: t("menu.profile", "Profile"),
    },
    {
      url: "/subscribe",
      icon: "uil:network-chart",
      title: t("menu.network", "Network"),
    },
    {
      url: "/order",
      icon: "uil:receipt",
      title: t("menu.order", "Orders"),
    },
    {
      url: "/wallet",
      icon: "uil:wallet",
      title: t("menu.wallet", "Wallet"),
    },
  ];
}
