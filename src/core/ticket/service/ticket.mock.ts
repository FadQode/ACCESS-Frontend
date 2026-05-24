import type { Ticket } from "../model/ticket.types";

export const mockTickets: Ticket[] = [
  {
    id: "ticket-0831",
    referenceNumber: "ACC-2026-0831",
    customerName: "Siti Nuraini",
    customerInitials: "SN",
    contact: "siti.n@mail.com",
    channel: "web-form",
    category: "delay",
    status: "new",
    submittedAt: "17 May 2026, 08:14",
    relativeTime: "2h ago",
    complaintText:
      "Selamat pagi. Kereta saya hari ini delay lebih dari 3 jam dari Surabaya ke Jakarta. Saya ada meeting penting dan tidak ada pemberitahuan sama sekali. Ini sangat mengecewakan dan merugikan saya. Tolong segera ditangani dan berikan kompensasi yang sesuai.",
    assignedAgent: "Rizky A.",
    pastComplaints: "2 resolved",
    responseChannel: "email",
    responseDraft: "",
    suggestedResponse:
      "Halo Ibu Siti, kami sangat memahami kekecewaan yang dirasakan akibat keterlambatan kereta hari ini, apalagi dengan meeting penting yang sudah direncanakan. Keterlambatan ini disebabkan oleh pekerjaan perawatan jalur yang tidak terduga. Karena delay melebihi 2 jam, Ibu berhak atas refund penuh atau penjadwalan ulang ke kereta berikutnya. Silakan balas email ini untuk memilih opsi yang diinginkan.",
    sopContext: {
      title: "SOP - delay handling",
      issue: "Delay > 3h",
      disruptionKnown: "Yes - track maintenance",
      eligibility: "Refund / reschedule",
      policyNote:
        "Delay above 2 hours is eligible for refund review or next-train reschedule.",
    },
    activityLog: [
      {
        id: "act-0831-3",
        label: "Assigned to Rizky A.",
        time: "08:16",
        actor: "System",
        tone: "primary",
      },
      {
        id: "act-0831-2",
        label: "Priority marked high from delay duration",
        time: "08:15",
        actor: "System",
        tone: "warning",
      },
      {
        id: "act-0831-1",
        label: "Ticket created from web form",
        time: "08:14",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "ticket-0829",
    referenceNumber: "ACC-2026-0829",
    customerName: "Budi Santoso",
    customerInitials: "BS",
    contact: "budi.santoso@mail.com",
    channel: "web-form",
    category: "refund",
    status: "open",
    submittedAt: "17 May 2026, 06:22",
    relativeTime: "4h ago",
    complaintText:
      "Saya ingin mengajukan refund untuk tiket yang sudah saya bayar, tetapi jadwal keberangkatan berubah dan tidak cocok dengan agenda saya.",
    assignedAgent: "Rizky A.",
    pastComplaints: "1 resolved",
    responseChannel: "email",
    responseDraft:
      "Halo Pak Budi, kami sedang memeriksa detail tiket dan perubahan jadwal pada pemesanan Bapak.",
    suggestedResponse:
      "Halo Pak Budi, kami akan bantu cek kelayakan refund berdasarkan perubahan jadwal pada tiket Bapak. Mohon tunggu sebentar sementara kami validasi detail pemesanan dan opsi pengembalian dana yang tersedia.",
    sopContext: {
      title: "SOP - refund review",
      issue: "Schedule changed by operator",
      disruptionKnown: "Schedule adjustment confirmed",
      eligibility: "Partial or full refund review",
      policyNote:
        "Refund amount depends on departure time, ticket class, and cancellation window.",
    },
    activityLog: [
      {
        id: "act-0829-2",
        label: "Agent started refund review",
        time: "06:48",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0829-1",
        label: "Ticket created from web form",
        time: "06:22",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "ticket-0827",
    referenceNumber: "ACC-2026-0827",
    customerName: "Dewi Rahayu",
    customerInitials: "DR",
    contact: "+62 817-6500-1120",
    channel: "quick-response",
    category: "cancellation",
    status: "new",
    submittedAt: "17 May 2026, 09:42",
    relativeTime: "30m ago",
    complaintText:
      "Saya ingin membatalkan tiket karena ada keperluan mendadak. Apakah pembatalan masih bisa diproses hari ini?",
    assignedAgent: "Rizky A.",
    pastComplaints: "No history",
    responseChannel: "whatsapp",
    responseDraft: "",
    suggestedResponse:
      "Halo Ibu Dewi, pembatalan masih dapat kami bantu proses sesuai ketentuan tiket. Kami akan cek batas waktu pembatalan dan estimasi dana yang dapat dikembalikan sebelum Ibu mengonfirmasi.",
    sopContext: {
      title: "SOP - cancellation",
      issue: "Customer-initiated cancellation",
      disruptionKnown: "No active disruption",
      eligibility: "Cancellation with admin fee",
      policyNote:
        "Confirm refund estimate before finalizing cancellation request.",
    },
    activityLog: [
      {
        id: "act-0827-1",
        label: "Ticket created from quick response form",
        time: "09:42",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "ticket-0825",
    referenceNumber: "ACC-2026-0825",
    customerName: "Ahmad Fauzi",
    customerInitials: "AF",
    contact: "+62 811-9007-2440",
    channel: "manual",
    category: "lost-item",
    status: "open",
    submittedAt: "17 May 2026, 09:05",
    relativeTime: "1h ago",
    complaintText:
      "Barang bawaan saya tertinggal di kereta eksekutif tujuan Semarang. Tas berwarna hitam dan ada dokumen kerja di dalamnya.",
    assignedAgent: "Rizky A.",
    pastComplaints: "No history",
    responseChannel: "phone",
    responseDraft:
      "Pak Ahmad, kami akan bantu koordinasikan dengan petugas stasiun tujuan.",
    suggestedResponse:
      "Pak Ahmad, laporan barang tertinggal sudah kami teruskan ke tim stasiun tujuan. Mohon kirimkan nomor kursi, gerbong, dan ciri detail tas agar pencarian dapat diprioritaskan.",
    sopContext: {
      title: "SOP - lost item",
      issue: "Passenger item left onboard",
      disruptionKnown: "No service disruption",
      eligibility: "Station follow-up required",
      policyNote:
        "Collect seat, coach number, item photo, and destination station before follow-up.",
    },
    activityLog: [
      {
        id: "act-0825-2",
        label: "Seat details requested",
        time: "09:18",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0825-1",
        label: "Ticket created manually from call",
        time: "09:05",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "ticket-0822",
    referenceNumber: "ACC-2026-0822",
    customerName: "Rina Marlina",
    customerInitials: "RM",
    contact: "rina.marlina@mail.com",
    channel: "email",
    category: "seat-issue",
    status: "resolved",
    submittedAt: "17 May 2026, 07:10",
    relativeTime: "3h ago",
    complaintText:
      "Kursi yang saya pesan tidak sesuai dengan nomor tiket. Petugas sudah membantu pindah, tetapi saya ingin memastikan catatan tiketnya benar.",
    assignedAgent: "Rizky A.",
    pastComplaints: "1 resolved",
    responseChannel: "email",
    responseDraft:
      "Ibu Rina, catatan penyesuaian kursi sudah tersimpan pada tiket Ibu. Terima kasih sudah melaporkan agar data perjalanan tetap akurat.",
    suggestedResponse:
      "Ibu Rina, catatan penyesuaian kursi sudah tersimpan pada tiket Ibu. Terima kasih sudah melaporkan agar data perjalanan tetap akurat.",
    sopContext: {
      title: "SOP - seat issue",
      issue: "Seat mismatch",
      disruptionKnown: "Coach reseating",
      eligibility: "No refund required",
      policyNote:
        "Confirm corrected seat record and close if passenger was reseated successfully.",
    },
    activityLog: [
      {
        id: "act-0822-3",
        label: "Ticket resolved",
        time: "07:40",
        actor: "Rizky A.",
        tone: "success",
      },
      {
        id: "act-0822-2",
        label: "Response sent",
        time: "07:36",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0822-1",
        label: "Ticket created from email",
        time: "07:10",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "ticket-0819",
    referenceNumber: "ACC-2026-0819",
    customerName: "Hendra Putra",
    customerInitials: "HP",
    contact: "hendra.p@mail.com",
    channel: "web-form",
    category: "facility",
    status: "escalated",
    submittedAt: "17 May 2026, 05:31",
    relativeTime: "5h ago",
    complaintText:
      "AC gerbong tidak berfungsi selama perjalanan dari Malang. Penumpang lain juga mengeluh karena sangat panas.",
    assignedAgent: "Rizky A.",
    pastComplaints: "3 resolved",
    responseChannel: "email",
    responseDraft: "",
    suggestedResponse:
      "Pak Hendra, kami mohon maaf atas kondisi AC gerbong yang tidak nyaman. Laporan ini sudah diteruskan ke tim sarana, dan kami akan mengabari Bapak setelah ada hasil pengecekan unit gerbong terkait.",
    sopContext: {
      title: "SOP - facility complaint",
      issue: "Coach AC failure",
      disruptionKnown: "Maintenance follow-up required",
      eligibility: "Service recovery voucher review",
      policyNote:
        "Escalate to operations if complaint involves multiple passengers or safety risk.",
    },
    activityLog: [
      {
        id: "act-0819-2",
        label: "Escalated to operations",
        time: "05:47",
        actor: "Rizky A.",
        tone: "danger",
      },
      {
        id: "act-0819-1",
        label: "Ticket created from web form",
        time: "05:31",
        actor: "System",
        tone: "muted",
      },
    ],
  },
];
