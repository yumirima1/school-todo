import {
  RecurringTask,
  RecurringTaskCategory,
  Subject,
} from "@/lib/types";

export type RecurringTaskGroup = {
  subjectId: string;
  subjectName: string;
  subjectShortName: string;
  subjectColor: string;
  tasks: RecurringTask[];
};

export function createRecurringTask(
  category: RecurringTaskCategory,
  title: string,
  description = "",
): RecurringTask {
  return {
    id: `recurring-${crypto.randomUUID()}`,
    title,
    description,
    category,
    active: true,
  };
}

export function getRecurringTasks(subject: Subject): RecurringTask[] {
  return [
    ...subject.recurringAssignments,
    ...subject.recurringQuizzes,
    ...subject.recurringPreparations,
  ];
}

export function getActiveRecurringGroups(subjects: Subject[]): RecurringTaskGroup[] {
  return subjects
    .map((subject) => ({
      subjectId: subject.id,
      subjectName: subject.name,
      subjectShortName: subject.shortName || subject.name,
      subjectColor: subject.color,
      tasks: getRecurringTasks(subject).filter((task) => task.active),
    }))
    .filter((group) => group.tasks.length);
}

export function getTaskListKey(category: RecurringTaskCategory) {
  if (category === "assignment") {
    return "recurringAssignments";
  }
  if (category === "quiz") {
    return "recurringQuizzes";
  }
  return "recurringPreparations";
}
