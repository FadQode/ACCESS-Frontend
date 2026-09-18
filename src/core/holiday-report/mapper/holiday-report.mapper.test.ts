// ponytail: assert checks run via `bun test` (no runner installed yet) —
// migrate to Vitest when CI needs it.
import { describe, expect, test } from "bun:test";
import type { HolidayOverviewResponse } from "../model/holiday-api.types";
import {
  getCalendarGridRange,
  getCalendarYearRange,
  mapOverviewToReportModel,
} from "./holiday-report.mapper";

const overview: HolidayOverviewResponse = {
  currentHoliday: {
    category: "regular_holiday",
    date: "2026-08-25",
    name: "Maulid Nabi",
  },
  monitoringPeriod: {
    after: 2,
    before: 3,
    end: "2026-08-27",
    start: "2026-08-22",
  },
  next: {
    holiday: {
      category: "lebaran",
      date: "2027-03-20",
      name: "Lebaran 1448 H",
    },
    monitoring: {
      after: 10,
      before: 30,
      end: "2027-03-30",
      start: "2027-02-18",
    },
  },
  referenceDate: "2026-08-26",
  relativeDay: 1,
  rules: {
    imlek: { after: 7, before: 7 },
    lebaran: { after: 10, before: 30 },
    nataru: { after: 10, before: 10 },
    other_long_holiday: { after: 7, before: 7 },
    regular_holiday: { after: 1, before: 1 },
  },
  status: "holiday",
};

describe("mapOverviewToReportModel", () => {
  const model = mapOverviewToReportModel(
    overview,
    new Date("2026-08-26T10:00:00"),
  );

  test("maps active status from the backend", () => {
    expect(model.status.kind).toBe("active");
    expect(model.status.activeHoliday?.name).toBe("Maulid Nabi");
    expect(model.status.relativeDay).toBe(1);
    expect(model.currentDate.getFullYear()).toBe(2026);
    expect(model.currentDate.getMonth()).toBe(7);
    expect(model.currentDate.getDate()).toBe(26);
  });

  test("maps monitoring window with holiday date on Hari H", () => {
    expect(model.currentPeriod?.before).toBe(3);
    expect(model.currentPeriod?.after).toBe(2);
    expect(model.currentPeriod?.holidayDate?.getDate()).toBe(25);
  });

  test("maps next period independently of current", () => {
    expect(model.nextHoliday?.category).toBe("lebaran");
    expect(model.nextPeriod?.start.getDate()).toBe(18);
    expect(model.nextPeriod?.end.getDate()).toBe(30);
    expect(model.nextPeriod?.before).toBe(30);
    expect(model.nextPeriod?.after).toBe(10);
  });

  test("orders all five backend rule categories", () => {
    expect(model.rules.map((rule) => rule.category)).toEqual([
      "lebaran",
      "nataru",
      "imlek",
      "other_long_holiday",
      "regular_holiday",
    ]);
    expect(model.rules[0].label).toBe("Lebaran");
    expect(model.rules[4].before).toBe(1);
  });

  test("normal status with upcoming holiday is inactive", () => {
    const inactive = mapOverviewToReportModel({
      ...overview,
      currentHoliday: null,
      monitoringPeriod: null,
      relativeDay: null,
      status: "normal",
    });

    expect(inactive.status.kind).toBe("inactive");
    expect(inactive.currentPeriod).toBeUndefined();
  });

  test("normal status without holidays is empty", () => {
    const empty = mapOverviewToReportModel({
      ...overview,
      currentHoliday: null,
      monitoringPeriod: null,
      next: null,
      relativeDay: null,
      status: "normal",
    });

    expect(empty.status.kind).toBe("empty");
    expect(empty.holidays).toHaveLength(0);
  });

  test("dedupes current and next holiday on the same date", () => {
    const current = overview.currentHoliday;
    const monitoring = overview.monitoringPeriod;

    if (!current || !monitoring) {
      throw new Error("fixture must define current holiday");
    }

    const merged = mapOverviewToReportModel({
      ...overview,
      next: { holiday: current, monitoring },
    });

    expect(merged.holidays).toHaveLength(1);
  });
});

describe("getCalendarGridRange", () => {
  test("covers the monday-first visible grid of August 2026", () => {
    expect(getCalendarGridRange(new Date(2026, 7, 15))).toEqual({
      end: "2026-09-06",
      start: "2026-07-27",
    });
  });

  test("handles months starting on monday", () => {
    // September 2026 starts on a Tuesday; June 2026 starts on a Monday.
    expect(getCalendarGridRange(new Date(2026, 5, 9)).start).toBe("2026-06-01");
  });
});

describe("getCalendarYearRange", () => {
  test("pads the year so adjacent-month grids are included", () => {
    expect(getCalendarYearRange(2026)).toEqual({
      end: "2027-01-07",
      start: "2025-12-25",
    });
  });

  test("contains every month grid of the year", () => {
    const window = getCalendarYearRange(2026);

    for (let month = 0; month < 12; month += 1) {
      const grid = getCalendarGridRange(new Date(2026, month, 1));

      expect(grid.start >= window.start).toBe(true);
      expect(grid.end <= window.end).toBe(true);
    }
  });

  test("keeps December and January grids in their own year windows", () => {
    // December 2025's grid spills into January, and vice versa. Both must be
    // covered by their own year window so navigation is never partly loaded.
    const december = getCalendarGridRange(new Date(2025, 11, 1));
    const january = getCalendarGridRange(new Date(2026, 0, 1));

    expect(december.start >= getCalendarYearRange(2025).start).toBe(true);
    expect(december.end <= getCalendarYearRange(2025).end).toBe(true);
    expect(january.start >= getCalendarYearRange(2026).start).toBe(true);
    expect(january.end <= getCalendarYearRange(2026).end).toBe(true);
  });
});
