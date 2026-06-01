import type { ManagerActionCluster } from "@/core/manager/model/manager-action.types";

export const mockManagerActionClusters: ManagerActionCluster[] = [
  {
    id: "mr-0142",
    displayId: "MR-2026-0142",
    title: "Train delay — Surabaya–Jakarta, 17 May",
    category: "delay",
    status: "pending",

    complaintCount: 5,
    agentCount: 3,
    raisedAt: "2026-05-17T08:52:00",
    relativeTime: "2h ago",

    affectedRoute: "Surabaya → Jakarta",
    detectedIssue: "Track maintenance — unscheduled",
    policyApplies: "Refund or reschedule eligible",
    similarPastCase: "Mar 2026, same route, resolved",
    recommendedAction: "Approve refund or reschedule for affected passengers",

    actionTaken:
      "Coordinated with operations team — full refund approved for all passengers on the 17 May Surabaya–Jakarta delay.",
    closureMessage:
      "Halo, kami ingin menginformasikan bahwa setelah berkoordinasi dengan tim operasional, kami telah menyetujui refund penuh untuk seluruh penumpang yang terdampak keterlambatan pada 17 Mei. Dana akan dikembalikan dalam 3–5 hari kerja ke metode pembayaran asal. Mohon maaf atas ketidaknyamanan yang ditimbulkan.",

    complaints: [
      {
        id: "c-001",
        linkedTicketId: "EXT-0832",
        customerName: "Siti Nuraini",
        customerInitials: "SN",
        source: "twitter",
        sourceLabel: "Twitter",
        agentName: "Rizky A.",
        complaintText:
          "Kereta saya delay lebih dari 3 jam dari Surabaya ke Jakarta, tidak ada pemberitahuan sama sekali.",
        status: "waiting_manager",
      },
      {
        id: "c-002",
        linkedTicketId: "EXT-0833",
        customerName: "Bagas Pratama",
        customerInitials: "BP",
        source: "instagram",
        sourceLabel: "Instagram",
        agentName: "Fajar N.",
        complaintText:
          "Info keterlambatan tidak jelas. Penumpang hanya menunggu di stasiun tanpa arahan.",
        status: "waiting_manager",
      },
      {
        id: "c-003",
        linkedTicketId: "EXT-0834",
        customerName: "Raka Mahendra",
        customerInitials: "RM",
        source: "web_form",
        sourceLabel: "Web Form",
        agentName: "Dian S.",
        complaintText:
          "Saya butuh kompensasi karena jadwal tiba berubah jauh dari tiket awal.",
        status: "waiting_manager",
      },
    ],

    references: [
      {
        id: "ref-001",
        type: "sop",
        title: "SOP — delay handling v2.1",
      },
      {
        id: "ref-002",
        type: "past_ticket",
        title: "Past ticket #0712 · Mar 2026",
      },
      {
        id: "ref-003",
        type: "policy",
        title: "Refund policy v3.2 §4.2",
      },
    ],
  },
  {
    id: "mr-0143",
    displayId: "MR-2026-0143",
    title: "Refund batch — cancelled May trips",
    category: "refund",
    status: "in_progress",

    complaintCount: 3,
    agentCount: 2,
    raisedAt: "2026-05-17T06:30:00",
    relativeTime: "4h ago",

    affectedRoute: "Multiple routes",
    detectedIssue: "Payment gateway settlement queue",
    policyApplies: "Refund eligible per cancellation policy v3.2",
    similarPastCase: "Apr 2026, same gateway issue, resolved in 48h",
    recommendedAction: "Verify settlement status with payment team",

    actionTaken:
      "Contacted payment team — settlement queue is being processed, estimated completion within 24 hours.",
    closureMessage:
      "Halo, kami mohon maaf atas keterlambatan pengembalian dana. Tim kami sedang memproses antrian settlement dan dana akan masuk dalam 1-2 hari kerja ke metode pembayaran asal. Silakan hubungi kami kembali jika belum diterima setelah 3 hari kerja.",

    assignedManager: "Mgr. Dina",

    complaints: [
      {
        id: "c-004",
        linkedTicketId: "EXT-0841",
        customerName: "Wulan Sari",
        customerInitials: "WS",
        source: "facebook",
        sourceLabel: "Facebook",
        agentName: "Laras N.",
        complaintText:
          "Pengembalian dana tiket batal belum masuk setelah lebih dari seminggu.",
        status: "waiting_manager",
      },
      {
        id: "c-005",
        linkedTicketId: "EXT-0842",
        customerName: "Dedi Kusuma",
        customerInitials: "DK",
        source: "web_form",
        sourceLabel: "Web Form",
        agentName: "Rizky A.",
        complaintText:
          "Pengembalian dana pembatalan belum diterima, layanan pelanggan hanya meminta menunggu.",
        status: "waiting_manager",
      },
    ],

    references: [
      {
        id: "ref-004",
        type: "policy",
        title: "Refund policy v3.2",
      },
      {
        id: "ref-005",
        type: "sop",
        title: "SOP settlement gateway",
      },
    ],
  },
  {
    id: "mr-0144",
    displayId: "MR-2026-0144",
    title: "App login failure — OTP not received",
    category: "app_issue",
    status: "done",

    complaintCount: 4,
    agentCount: 2,
    raisedAt: "2026-05-16T14:20:00",
    relativeTime: "1d ago",

    detectedIssue: "SMS delivery delay from provider",
    policyApplies: "Official explanation sufficient — no compensation needed",
    similarPastCase: "Feb 2026, same provider, resolved in 2h",
    recommendedAction: "Provide official explanation and retry steps",

    actionTaken:
      "Confirmed with IT — SMS provider delay has been resolved. Affected users can request OTP again.",
    closureMessage:
      "Halo, kendala pengiriman OTP dari provider SMS kami sudah terselesaikan. Silakan coba meminta OTP ulang dan login kembali. Jika kendala masih terjadi setelah 15 menit, hubungi kanal bantuan kami. Mohon maaf atas ketidaknyamanannya.",

    completedBy: "Mgr. Dina",
    completedAt: "10:14",

    complaints: [
      {
        id: "c-006",
        linkedTicketId: "EXT-0851",
        customerName: "Nabila Putri",
        customerInitials: "NP",
        source: "instagram",
        sourceLabel: "Instagram",
        agentName: "Fajar N.",
        complaintText:
          "Tidak bisa login aplikasi, kode OTP tidak pernah masuk ke SMS.",
        status: "ready_to_notify",
      },
      {
        id: "c-007",
        linkedTicketId: "EXT-0852",
        customerName: "Ahmad Rizal",
        customerInitials: "AR",
        source: "google_play",
        sourceLabel: "Google Play",
        agentName: "Dian S.",
        complaintText:
          "Aplikasi terus gagal login, OTP tidak terkirim. Saya sudah coba 3 kali.",
        status: "ready_to_notify",
      },
    ],

    references: [
      {
        id: "ref-006",
        type: "document",
        title: "Incident log — IT recovery notes",
      },
      {
        id: "ref-007",
        type: "sop",
        title: "SOP OTP issue handling",
      },
    ],
  },
];
