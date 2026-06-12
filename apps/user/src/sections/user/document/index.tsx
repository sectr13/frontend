"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { queryDocumentList } from "@workspace/ui/services/user/document";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/empty-state";
import { DocumentButton } from "@/sections/user/document/document-button";

export default function Document() {
  const { t } = useTranslation("document");

  const { data } = useQuery({
    queryKey: ["queryDocumentList"],
    queryFn: async () => {
      const response = await queryDocumentList();
      const list = response.data.data?.list || [];
      return {
        tags: Array.from(
          new Set(
            list.reduce((acc: string[], item) => acc.concat(item.tags), [])
          )
        ),
        list,
      };
    },
  });
  const { tags, list: DocumentList } = data || { tags: [], list: [] };

  if (!DocumentList || DocumentList.length === 0) {
    return (
      <EmptyState
        description={t(
          "guidesDesc",
          "Check back soon for setup guides and tutorials."
        )}
        icon="uil:book-open"
        title={t("guidesBeingPrepared", "Guides are being prepared.")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-1.5 font-semibold">
        {t("document", "Document")}
      </h2>
      <Tabs defaultValue="all">
        <TabsList className="h-full flex-wrap">
          <TabsTrigger value="all">{t("all", "All")}</TabsTrigger>
          {tags?.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">
          <DocumentButton items={DocumentList} />
        </TabsContent>
        {tags?.map((item) => (
          <TabsContent key={item} value={item}>
            <DocumentButton
              items={DocumentList.filter((docs) =>
                item ? docs.tags.includes(item) : true
              )}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
