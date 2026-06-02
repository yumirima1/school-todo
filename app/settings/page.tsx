import { PhaseTwoPage } from "@/components/phase-two-page";

export default function SettingsPage() {
  return (
    <PhaseTwoPage
      title="設定"
      description="教科、時限数、土曜授業、テーマカラーを編集できるようにします。"
      items={[
        "教科一覧の編集",
        "時限数と土曜授業の設定",
        "テーマカラーとダークモード",
      ]}
    />
  );
}
