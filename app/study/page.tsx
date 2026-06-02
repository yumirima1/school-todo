import { PhaseTwoPage } from "@/components/phase-two-page";

export default function StudyPage() {
  return (
    <PhaseTwoPage
      title="予習・復習管理"
      description="教科ごとの予習、復習、小テスト準備を次の授業に合わせて管理します。"
      items={[
        "教科、範囲、期限、種類、状態、メモの保存",
        "次の授業までに必要な予習の強調表示",
        "今日やる学習タスクのトップ表示",
      ]}
    />
  );
}
