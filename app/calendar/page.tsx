import { PhaseTwoPage } from "@/components/phase-two-page";

export default function CalendarPage() {
  return (
    <PhaseTwoPage
      title="カレンダー"
      description="提出物、予習、行事を日付ごとにまとめる週表示を追加予定です。"
      items={[
        "今週の提出物と行事の一覧",
        "日付ごとの予習・復習タスク表示",
        "余裕があれば月表示を追加",
      ]}
    />
  );
}
