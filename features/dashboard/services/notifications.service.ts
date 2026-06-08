import type { Activity } from "../types";

export type NotificationKind = "overdue" | "today" | "upcoming";

export interface NotificationItem {
  id: string;
  activityId: string;
  title: string;
  description: string;
  kind: NotificationKind;
  statusLabel: string;
  scheduledAt: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_NOTIFICATIONS = 10;
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const KIND_ORDER: Record<NotificationKind, number> = {
  overdue: 0,
  today: 1,
  upcoming: 2,
};

export function buildActivityNotifications(
  activities: Activity[],
  now = new Date()
): NotificationItem[] {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);
  const upcomingEnd = new Date(tomorrowStart.getTime() + 7 * DAY_MS);

  return activities
    .filter((activity) => activity.status !== "Selesai")
    .map((activity) => {
      const scheduledDate = parseActivityDate(activity.tanggal, activity.waktu);
      if (!scheduledDate) return null;

      const kind = getNotificationKind(
        scheduledDate,
        todayStart,
        tomorrowStart,
        upcomingEnd
      );
      if (!kind) return null;

      return {
        id: `notification-${activity.id}`,
        activityId: activity.id,
        title: activity.kegiatan,
        description: `${activity.nasabah || "Tanpa nasabah"} - ${formatNotificationDate(scheduledDate)}, ${activity.waktu}`,
        kind,
        statusLabel: getStatusLabel(kind),
        scheduledAt: scheduledDate.getTime(),
      };
    })
    .filter((notification): notification is NotificationItem => notification !== null)
    .sort((a, b) => {
      const kindDiff = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      return kindDiff === 0 ? a.scheduledAt - b.scheduledAt : kindDiff;
    })
    .slice(0, MAX_NOTIFICATIONS);
}

function parseActivityDate(dateValue: string, timeValue: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (month < 1 || month > 12 || hour > 23 || minute > 59) return null;

  const parsed = new Date(year, month - 1, day, hour, minute);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function getNotificationKind(
  scheduledDate: Date,
  todayStart: Date,
  tomorrowStart: Date,
  upcomingEnd: Date
): NotificationKind | null {
  if (scheduledDate < todayStart) return "overdue";
  if (scheduledDate < tomorrowStart) return "today";
  if (scheduledDate < upcomingEnd) return "upcoming";
  return null;
}

function formatNotificationDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function getStatusLabel(kind: NotificationKind): string {
  if (kind === "overdue") return "Terlambat";
  if (kind === "today") return "Hari ini";
  return "Mendatang";
}
