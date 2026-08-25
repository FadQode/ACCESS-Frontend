import type { LongHoliday, MonitoringRule } from "./holiday-report.types";

export const monitoringRules: MonitoringRule[] = [
  {
    after: 10,
    before: 30,
    description: "Monitoring lebih panjang untuk lonjakan trafik Lebaran.",
    label: "Lebaran",
    type: "lebaran",
  },
  {
    after: 10,
    before: 10,
    description: "Mengikuti periode Natal dan Tahun Baru.",
    label: "Nataru",
    type: "nataru",
  },
  {
    after: 7,
    before: 7,
    description: "Window ringkas untuk periode Imlek.",
    label: "Imlek",
    type: "imlek",
  },
  {
    after: 7,
    before: 7,
    description: "Untuk libur panjang lain yang ditetapkan.",
    label: "Libur Panjang Lain",
    type: "other",
  },
];

export const mockLongHolidays: LongHoliday[] = [
  {
    date: "2027-03-14",
    id: "lebaran-2027",
    name: "Lebaran 2027",
    ruleType: "lebaran",
    sourceLabel: "Pemerintah · KAI",
  },
  {
    date: "2027-05-28",
    id: "long-weekend-vesak-2027",
    name: "Libur Panjang Waisak 2027",
    ruleType: "other",
    sourceLabel: "Pemerintah",
  },
  {
    date: "2027-12-25",
    id: "nataru-2027",
    name: "Nataru 2027",
    ruleType: "nataru",
    sourceLabel: "Pemerintah · KAI",
  },
];

export const HOLIDAY_REPORT_TODAY = "2027-02-01";
