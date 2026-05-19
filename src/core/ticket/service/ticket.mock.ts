import type { TicketDetailData } from "../model/ticket.types";

export const mockTickets: TicketDetailData[] = [
  {
    id: "#0831",
    customerName: "Siti Nuraini",
    preview: "Kereta saya delay lebih dari 3 jam dari Surabaya...",
    category: "delay",
    status: "open",
    priority: "high",
    relativeTime: "2h ago",
    openedAt: "2h ago",
    assignedAgent: "Rizky A.",
    escalated: true,
    customer: {
      name: "Siti Nuraini",
      initials: "SN",
      contact: "+62 812-3456-7890",
      channel: "Web chat",
      pastComplaints: "2 resolved",
      lastContact: "3 months ago",
    },
    messages: [
      {
        id: "msg-0831-1",
        senderType: "customer",
        senderName: "Siti Nuraini",
        content:
          "Selamat pagi. Kereta saya hari ini delay lebih dari 3 jam dari Surabaya ke Jakarta. Saya ada meeting penting dan tidak ada pemberitahuan sama sekali dari KAI. Tolong segera ditangani.",
        time: "08:14",
      },
      {
        id: "msg-0831-2",
        senderType: "agent",
        senderName: "Rizky A.",
        content:
          "Selamat pagi Ibu Siti. Saya memahami betapa tidak nyamannya situasi ini. Izinkan saya segera mengecek status kereta Anda dan mencari solusi terbaik untuk Ibu.",
        time: "08:51",
      },
      {
        id: "msg-0831-3",
        senderType: "system",
        content: "Escalated to supervisory team",
        time: "09:30",
      },
      {
        id: "msg-0831-4",
        senderType: "customer",
        senderName: "Siti Nuraini",
        content:
          "Sudah hampir 2 jam tidak ada update lagi. Ini sangat mengecewakan. Apakah bisa diproses refund atau dijadwalkan ulang ke kereta berikutnya?",
        time: "10:03",
      },
      {
        id: "msg-0831-5",
        senderType: "system",
        content: "Rizky A. is drafting a reply...",
        time: "10:08",
      },
    ],
    serviceContext: {
      reportedIssue: "Train delay >3h",
      route: "Sby -> Jkt",
      knownDisruption: "Yes - track maintenance",
      refundPolicy: "Refund eligible",
    },
    suggestedResponse: {
      title: "Draft - delay + refund",
      content:
        "Ibu Siti, kami mohon maaf atas ketidaknyamanan ini. Delay disebabkan oleh pekerjaan perawatan jalur yang tidak terduga. Karena delay melebihi 2 jam, Ibu berhak mengajukan refund penuh. Kami siap memproses ini sekarang atau menawarkan jadwal ulang ke kereta berikutnya.",
    },
    activityLog: [
      {
        id: "act-0831-1",
        label: "Escalated to supervisor",
        time: "09:30",
        actor: "Rizky A.",
        tone: "danger",
      },
      {
        id: "act-0831-2",
        label: "First reply sent",
        time: "08:51",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0831-3",
        label: "Ticket opened, assigned",
        time: "08:14",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "#0829",
    customerName: "Budi Santoso",
    preview: "Saya ingin mengajukan refund untuk tiket yang sudah...",
    category: "refund",
    status: "new",
    priority: "medium",
    relativeTime: "4h ago",
    openedAt: "4h ago",
    assignedAgent: "Rizky A.",
    escalated: false,
    customer: {
      name: "Budi Santoso",
      initials: "BS",
      contact: "+62 813-2211-4900",
      channel: "Mobile app",
      pastComplaints: "1 resolved",
      lastContact: "6 weeks ago",
    },
    messages: [
      {
        id: "msg-0829-1",
        senderType: "customer",
        senderName: "Budi Santoso",
        content:
          "Saya ingin mengajukan refund untuk tiket yang sudah saya bayar, tetapi jadwal keberangkatan berubah dan tidak cocok dengan agenda saya.",
        time: "06:22",
      },
    ],
    serviceContext: {
      reportedIssue: "Refund request",
      route: "Bdg -> Slo",
      knownDisruption: "Schedule adjustment",
      refundPolicy: "Partial refund review",
    },
    suggestedResponse: {
      title: "Draft - refund review",
      content:
        "Pak Budi, kami akan bantu cek kelayakan refund berdasarkan perubahan jadwal pada tiket Bapak. Mohon tunggu sebentar sementara kami validasi detail pemesanan dan opsi pengembalian dana yang tersedia.",
    },
    activityLog: [
      {
        id: "act-0829-1",
        label: "Ticket opened",
        time: "06:22",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "#0827",
    customerName: "Dewi Rahayu",
    preview: "Saya ingin membatalkan karena ada keperluan mendadak...",
    category: "cancellation",
    status: "new",
    priority: "medium",
    relativeTime: "30m ago",
    openedAt: "30m ago",
    assignedAgent: "Rizky A.",
    escalated: false,
    customer: {
      name: "Dewi Rahayu",
      initials: "DR",
      contact: "+62 817-6500-1120",
      channel: "Web chat",
      pastComplaints: "No history",
      lastContact: "First contact",
    },
    messages: [
      {
        id: "msg-0827-1",
        senderType: "customer",
        senderName: "Dewi Rahayu",
        content:
          "Saya ingin membatalkan karena ada keperluan mendadak. Apakah masih bisa diproses hari ini?",
        time: "09:42",
      },
    ],
    serviceContext: {
      reportedIssue: "Cancellation request",
      route: "Jkt -> Yk",
      knownDisruption: "No active disruption",
      refundPolicy: "Admin fee applies",
    },
    suggestedResponse: {
      title: "Draft - cancellation",
      content:
        "Ibu Dewi, pembatalan masih dapat kami bantu proses sesuai ketentuan tiket. Kami akan cek batas waktu pembatalan dan estimasi dana yang dapat dikembalikan sebelum Ibu mengonfirmasi.",
    },
    activityLog: [
      {
        id: "act-0827-1",
        label: "Ticket opened",
        time: "09:42",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "#0825",
    customerName: "Ahmad Fauzi",
    preview: "Barang bawaan tertinggal di kereta eksekutif tujuan...",
    category: "lost-item",
    status: "open",
    priority: "low",
    relativeTime: "1h ago",
    openedAt: "1h ago",
    assignedAgent: "Rizky A.",
    escalated: false,
    customer: {
      name: "Ahmad Fauzi",
      initials: "AF",
      contact: "+62 811-9007-2440",
      channel: "Call center",
      pastComplaints: "No history",
      lastContact: "1h ago",
    },
    messages: [
      {
        id: "msg-0825-1",
        senderType: "customer",
        senderName: "Ahmad Fauzi",
        content:
          "Barang bawaan tertinggal di kereta eksekutif tujuan Semarang. Tas berwarna hitam ada dokumen kerja di dalamnya.",
        time: "09:05",
      },
      {
        id: "msg-0825-2",
        senderType: "agent",
        senderName: "Rizky A.",
        content:
          "Pak Ahmad, kami akan bantu koordinasikan dengan petugas stasiun tujuan. Mohon informasikan nomor kursi dan gerbong.",
        time: "09:18",
      },
    ],
    serviceContext: {
      reportedIssue: "Lost item",
      route: "Jkt -> Smg",
      knownDisruption: "No active disruption",
      refundPolicy: "Lost item SOP active",
    },
    suggestedResponse: {
      title: "Draft - lost item",
      content:
        "Pak Ahmad, laporan barang tertinggal sudah kami teruskan ke tim stasiun tujuan. Mohon kirimkan nomor kursi, gerbong, dan ciri detail tas agar pencarian dapat diprioritaskan.",
    },
    activityLog: [
      {
        id: "act-0825-1",
        label: "Agent requested seat details",
        time: "09:18",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0825-2",
        label: "Ticket opened",
        time: "09:05",
        actor: "System",
        tone: "muted",
      },
    ],
  },
  {
    id: "#0822",
    customerName: "Rina Marlina",
    preview: "Kursi yang saya pesan tidak sesuai dengan nomor tiket...",
    category: "seat-issue",
    status: "closed",
    priority: "low",
    relativeTime: "3h ago",
    openedAt: "3h ago",
    assignedAgent: "Rizky A.",
    escalated: false,
    customer: {
      name: "Rina Marlina",
      initials: "RM",
      contact: "+62 812-1000-7766",
      channel: "Station desk",
      pastComplaints: "1 resolved",
      lastContact: "Today",
    },
    messages: [
      {
        id: "msg-0822-1",
        senderType: "customer",
        senderName: "Rina Marlina",
        content:
          "Kursi yang saya pesan tidak sesuai dengan nomor tiket. Petugas sudah membantu pindah, tetapi saya ingin memastikan catatan tiketnya benar.",
        time: "07:10",
      },
      {
        id: "msg-0822-2",
        senderType: "system",
        content: "Ticket resolved at station desk",
        time: "07:40",
      },
    ],
    serviceContext: {
      reportedIssue: "Seat mismatch",
      route: "Bgr -> Cn",
      knownDisruption: "Coach reseating",
      refundPolicy: "No refund needed",
    },
    suggestedResponse: {
      title: "Draft - seat issue",
      content:
        "Ibu Rina, catatan penyesuaian kursi sudah tersimpan pada tiket Ibu. Terima kasih sudah melaporkan agar data perjalanan tetap akurat.",
    },
    activityLog: [
      {
        id: "act-0822-1",
        label: "Resolved at station desk",
        time: "07:40",
        actor: "Station staff",
        tone: "primary",
      },
    ],
  },
  {
    id: "#0819",
    customerName: "Hendra Putra",
    preview: "AC gerbong tidak berfungsi selama perjalanan dari Malang...",
    category: "facility",
    status: "open",
    priority: "low",
    relativeTime: "5h ago",
    openedAt: "5h ago",
    assignedAgent: "Rizky A.",
    escalated: false,
    customer: {
      name: "Hendra Putra",
      initials: "HP",
      contact: "+62 821-7755-1200",
      channel: "Email",
      pastComplaints: "3 resolved",
      lastContact: "2 months ago",
    },
    messages: [
      {
        id: "msg-0819-1",
        senderType: "customer",
        senderName: "Hendra Putra",
        content:
          "AC gerbong tidak berfungsi selama perjalanan dari Malang. Penumpang lain juga mengeluh karena sangat panas.",
        time: "05:31",
      },
    ],
    serviceContext: {
      reportedIssue: "Facility complaint",
      route: "Mlg -> Sby",
      knownDisruption: "Coach AC maintenance needed",
      refundPolicy: "Service recovery voucher",
    },
    suggestedResponse: {
      title: "Draft - facility complaint",
      content:
        "Pak Hendra, kami mohon maaf atas kondisi AC gerbong yang tidak nyaman. Laporan ini akan diteruskan ke tim sarana, dan kami akan cek opsi kompensasi layanan yang tersedia.",
    },
    activityLog: [
      {
        id: "act-0819-1",
        label: "Ticket opened",
        time: "05:31",
        actor: "System",
        tone: "muted",
      },
    ],
  },
];
