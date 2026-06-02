import { PhaseTwoPage } from "@/components/phase-two-page";

export default function SubjectsPage() {
  return (
    <PhaseTwoPage
      title="教科別まとめ"
      description="教科ごとに提出物、学習タスク、次の授業、メモを集約します。"
      items={[
        "教科ごとの提出物一覧",
        "次の授業と持ち物の確認",
        "教科メモと色分け管理",
      ]}
    />
  );
}
