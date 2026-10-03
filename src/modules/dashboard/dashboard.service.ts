import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { PatientsPerDoctorQuery, TimelineRange } from "./dashboard.schema";

// Timezone used to bucket records by day/month, change it if the audience differs
const TIMEZONE = "Asia/Dhaka";
const DAY_MS = 24 * 60 * 60 * 1000;
// en-CA locale formats dates as YYYY-MM-DD
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Bucket format and a lookback window that safely covers the whole range
const rangeConfig: Record<
  TimelineRange,
  { format: string; lookbackMs: number }
> = {
  "7d": { format: "%Y-%m-%d", lookbackMs: 7 * DAY_MS },
  "30d": { format: "%Y-%m-%d", lookbackMs: 30 * DAY_MS },
  "12m": { format: "%Y-%m", lookbackMs: 372 * DAY_MS },
};

// Builds the ordered bucket keys (YYYY-MM-DD or YYYY-MM) so empty buckets show as 0
const buildKeys = (range: TimelineRange) => {
  const now = new Date();

  if (range === "12m") {
    const [year, month] = dayFormatter.format(now).split("-").map(Number);
    return Array.from({ length: 12 }, (_, i) => {
      // Date.UTC rolls negative months into the previous year automatically
      const d = new Date(Date.UTC(year, month - 1 - (11 - i), 1));
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    });
  }

  const days = range === "7d" ? 7 : 30;
  return Array.from({ length: days }, (_, i) =>
    dayFormatter.format(new Date(now.getTime() - (days - 1 - i) * DAY_MS)),
  );
};

// Groups one collection by created date using an aggregation pipeline
const countByBucket = async (
  model: "doctor" | "patient",
  format: string,
  since: Date,
) => {
  const pipeline: Prisma.InputJsonValue[] = [
    // Raw pipelines need dates in extended JSON format
    { $match: { createdAt: { $gte: { $date: since.toISOString() } } } },
    {
      $group: {
        _id: {
          $dateToString: { format, date: "$createdAt", timezone: TIMEZONE },
        },
        count: { $sum: 1 },
      },
    },
  ];

  const rows = (await (model === "doctor"
    ? prisma.doctor.aggregateRaw({ pipeline })
    : prisma.patient.aggregateRaw({ pipeline }))) as unknown as {
    _id: string;
    count: number;
  }[];

  return new Map(rows.map((r) => [r._id, Number(r.count)]));
};

export const dashboardService = {
  async summary() {
    const since = new Date(Date.now() - 7 * DAY_MS);

    const [
      totalDoctors,
      totalPatients,
      newDoctorsLast7Days,
      newPatientsLast7Days,
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.doctor.count({ where: { createdAt: { gte: since } } }),
      prisma.patient.count({ where: { createdAt: { gte: since } } }),
    ]);

    return {
      totalDoctors,
      totalPatients,
      newDoctorsLast7Days,
      newPatientsLast7Days,
      // Rounded to one decimal place
      avgPatientsPerDoctor: totalDoctors
        ? Math.round((totalPatients / totalDoctors) * 10) / 10
        : 0,
    };
  },

  async patientsPerDoctor({ limit }: PatientsPerDoctorQuery) {
    // Count patients per doctor and keep only the top N
    const groups = await prisma.patient.groupBy({
      by: ["doctorId"],
      _count: { _all: true },
      orderBy: { _count: { doctorId: "desc" } },
      take: limit,
    });

    const doctors = await prisma.doctor.findMany({
      where: { id: { in: groups.map((g) => g.doctorId) } },
      select: { id: true, name: true, specialization: true },
    });
    const doctorMap = new Map(doctors.map((d) => [d.id, d]));

    // Keep the groupBy order and skip any orphaned doctor ids
    return groups.flatMap((g) => {
      const doctor = doctorMap.get(g.doctorId);
      return doctor
        ? [
            {
              doctorId: doctor.id,
              name: doctor.name,
              specialization: doctor.specialization,
              patientCount: g._count._all,
            },
          ]
        : [];
    });
  },

  async timeline(range: TimelineRange) {
    const { format, lookbackMs } = rangeConfig[range];
    const since = new Date(Date.now() - lookbackMs);

    // Both collections are aggregated in parallel
    const [doctorCounts, patientCounts] = await Promise.all([
      countByBucket("doctor", format, since),
      countByBucket("patient", format, since),
    ]);

    // Buckets outside the requested range are dropped by building from keys
    const data = buildKeys(range).map((date) => ({
      date,
      doctors: doctorCounts.get(date) ?? 0,
      patients: patientCounts.get(date) ?? 0,
    }));

    return { range, data };
  },

  async conditions() {
    const TOP = 8;

    const pipeline: Prisma.InputJsonValue[] = [
      // Group case-insensitively so "Diabetes" and "diabetes" are merged
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$condition" } } },
          label: { $first: "$condition" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: TOP },
    ];

    const [rows, total] = await Promise.all([
      prisma.patient.aggregateRaw({ pipeline }) as unknown as Promise<
        { label: string; count: number }[]
      >,
      prisma.patient.count(),
    ]);

    const data = rows.map((r) => ({
      condition: r.label,
      count: Number(r.count),
    }));

    // Everything outside the top N is merged into one "Others" slice
    const others = total - data.reduce((sum, r) => sum + r.count, 0);
    if (others > 0) data.push({ condition: "Others", count: others });

    return { total, data };
  },
};
