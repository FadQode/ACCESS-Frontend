import type { FollowUpTicket, Ticket } from "../model/ticket.types";

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
    submittedAt: "17 Mei 2026, 08:14",
    relativeTime: "2 jam lalu",
    complaintText:
      "Selamat pagi. Kereta saya hari ini terlambat lebih dari 3 jam dari Surabaya ke Jakarta. Saya ada meeting penting dan tidak ada pemberitahuan sama sekali. Ini sangat mengecewakan dan merugikan saya. Tolong segera ditangani dan berikan kompensasi yang sesuai.",
    assignedAgent: "Rizky A.",
    pastComplaints: "2 selesai",
    responseChannel: "email",
    responseDraft: "",
    suggestedResponse:
      "Halo Ibu Siti, kami sangat memahami kekecewaan yang dirasakan akibat keterlambatan kereta hari ini, apalagi dengan meeting penting yang sudah direncanakan. Keterlambatan ini disebabkan oleh pekerjaan perawatan jalur yang tidak terduga. Karena keterlambatan melebihi 2 jam, Ibu berhak atas pengembalian dana penuh atau penjadwalan ulang ke kereta berikutnya. Silakan balas email ini untuk memilih opsi yang diinginkan.",
    sopContext: {
      title: "SOP - penanganan keterlambatan",
      issue: "Keterlambatan > 3 jam",
      disruptionKnown: "Ya - perawatan jalur",
      eligibility: "Pengembalian dana / jadwal ulang",
      policyNote:
        "Keterlambatan di atas 2 jam memenuhi syarat untuk peninjauan pengembalian dana atau jadwal ulang kereta berikutnya.",
    },
    activityLog: [
      {
        id: "act-0831-3",
        label: "Ditugaskan kepada Rizky A.",
        time: "08:16",
        actor: "Sistem",
        tone: "primary",
      },
      {
        id: "act-0831-2",
        label: "Prioritas ditandai tinggi berdasarkan durasi keterlambatan",
        time: "08:15",
        actor: "Sistem",
        tone: "warning",
      },
      {
        id: "act-0831-1",
        label: "Tiket dibuat dari formulir web",
        time: "08:14",
        actor: "Sistem",
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
    submittedAt: "17 Mei 2026, 06:22",
    relativeTime: "4 jam lalu",
    complaintText:
      "Saya ingin mengajukan pengembalian dana untuk tiket yang sudah saya bayar, tetapi jadwal keberangkatan berubah dan tidak cocok dengan agenda saya.",
    assignedAgent: "Rizky A.",
    pastComplaints: "1 selesai",
    responseChannel: "email",
    responseDraft:
      "Halo Pak Budi, kami sedang memeriksa detail tiket dan perubahan jadwal pada pemesanan Bapak.",
    suggestedResponse:
      "Halo Pak Budi, kami akan bantu cek kelayakan pengembalian dana berdasarkan perubahan jadwal pada tiket Bapak. Mohon tunggu sebentar sementara kami validasi detail pemesanan dan opsi pengembalian dana yang tersedia.",
    sopContext: {
      title: "SOP - peninjauan pengembalian dana",
      issue: "Jadwal diubah oleh operator",
      disruptionKnown: "Penyesuaian jadwal terkonfirmasi",
      eligibility: "Peninjauan pengembalian dana sebagian atau penuh",
      policyNote:
        "Jumlah pengembalian dana bergantung pada waktu keberangkatan, kelas tiket, dan batas waktu pembatalan.",
    },
    activityLog: [
      {
        id: "act-0829-2",
        label: "Agen memulai peninjauan pengembalian dana",
        time: "06:48",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0829-1",
        label: "Tiket dibuat dari formulir web",
        time: "06:22",
        actor: "Sistem",
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
    submittedAt: "17 Mei 2026, 09:42",
    relativeTime: "30 menit lalu",
    complaintText:
      "Saya ingin membatalkan tiket karena ada keperluan mendadak. Apakah pembatalan masih bisa diproses hari ini?",
    assignedAgent: "Rizky A.",
    pastComplaints: "Belum ada riwayat",
    responseChannel: "whatsapp",
    responseDraft: "",
    suggestedResponse:
      "Halo Ibu Dewi, pembatalan masih dapat kami bantu proses sesuai ketentuan tiket. Kami akan cek batas waktu pembatalan dan estimasi dana yang dapat dikembalikan sebelum Ibu mengonfirmasi.",
    sopContext: {
      title: "SOP - cancellation",
      issue: "Pembatalan diajukan pelanggan",
      disruptionKnown: "Tidak ada gangguan aktif",
      eligibility: "Pembatalan dengan biaya admin",
      policyNote:
        "Konfirmasi estimasi pengembalian dana sebelum menyelesaikan permintaan pembatalan.",
    },
    activityLog: [
      {
        id: "act-0827-1",
        label: "Tiket dibuat dari Quick Response",
        time: "09:42",
        actor: "Sistem",
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
    submittedAt: "17 Mei 2026, 09:05",
    relativeTime: "1 jam lalu",
    complaintText:
      "Barang bawaan saya tertinggal di kereta eksekutif tujuan Semarang. Tas berwarna hitam dan ada dokumen kerja di dalamnya.",
    assignedAgent: "Rizky A.",
    pastComplaints: "Belum ada riwayat",
    responseChannel: "phone",
    responseDraft:
      "Pak Ahmad, kami akan bantu koordinasikan dengan petugas stasiun tujuan.",
    suggestedResponse:
      "Pak Ahmad, laporan barang tertinggal sudah kami teruskan ke tim stasiun tujuan. Mohon kirimkan nomor kursi, gerbong, dan ciri detail tas agar pencarian dapat diprioritaskan.",
    sopContext: {
      title: "SOP - lost item",
      issue: "Barang penumpang tertinggal di kereta",
      disruptionKnown: "Tidak ada gangguan layanan",
      eligibility: "Perlu tindak lanjut stasiun",
      policyNote:
        "Kumpulkan nomor kursi, nomor gerbong, foto barang, dan stasiun tujuan sebelum tindak lanjut.",
    },
    activityLog: [
      {
        id: "act-0825-2",
        label: "Detail kursi diminta",
        time: "09:18",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0825-1",
        label: "Tiket dibuat manual dari panggilan",
        time: "09:05",
        actor: "Sistem",
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
    submittedAt: "17 Mei 2026, 07:10",
    relativeTime: "3 jam lalu",
    complaintText:
      "Kursi yang saya pesan tidak sesuai dengan nomor tiket. Petugas sudah membantu pindah, tetapi saya ingin memastikan catatan tiketnya benar.",
    assignedAgent: "Rizky A.",
    pastComplaints: "1 selesai",
    responseChannel: "email",
    responseDraft:
      "Ibu Rina, catatan penyesuaian kursi sudah tersimpan pada tiket Ibu. Terima kasih sudah melaporkan agar data perjalanan tetap akurat.",
    suggestedResponse:
      "Ibu Rina, catatan penyesuaian kursi sudah tersimpan pada tiket Ibu. Terima kasih sudah melaporkan agar data perjalanan tetap akurat.",
    sopContext: {
      title: "SOP - seat issue",
      issue: "Seat mismatch",
      disruptionKnown: "Penyesuaian kursi gerbong",
      eligibility: "Pengembalian dana tidak diperlukan",
      policyNote:
        "Confirm corrected seat record and close if passenger was reseated successfully.",
    },
    activityLog: [
      {
        id: "act-0822-3",
        label: "Tiket diselesaikan",
        time: "07:40",
        actor: "Rizky A.",
        tone: "success",
      },
      {
        id: "act-0822-2",
        label: "Balasan dikirim",
        time: "07:36",
        actor: "Rizky A.",
        tone: "primary",
      },
      {
        id: "act-0822-1",
        label: "Tiket dibuat dari email",
        time: "07:10",
        actor: "Sistem",
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
    submittedAt: "17 Mei 2026, 05:31",
    relativeTime: "5 jam lalu",
    complaintText:
      "AC gerbong tidak berfungsi selama perjalanan dari Malang. Penumpang lain juga mengeluh karena sangat panas.",
    assignedAgent: "Rizky A.",
    pastComplaints: "3 selesai",
    responseChannel: "email",
    responseDraft: "",
    suggestedResponse:
      "Pak Hendra, kami mohon maaf atas kondisi AC gerbong yang tidak nyaman. Laporan ini sudah diteruskan ke tim sarana, dan kami akan mengabari Bapak setelah ada hasil pengecekan unit gerbong terkait.",
    sopContext: {
      title: "SOP - keluhan fasilitas",
      issue: "AC gerbong bermasalah",
      disruptionKnown: "Perlu tindak lanjut perawatan",
      eligibility: "Peninjauan voucher pemulihan layanan",
      policyNote:
        "Eskalasi ke operasional jika keluhan melibatkan banyak penumpang atau risiko keselamatan.",
    },
    activityLog: [
      {
        id: "act-0819-2",
        label: "Dieskalasi ke operasional",
        time: "05:47",
        actor: "Rizky A.",
        tone: "danger",
      },
      {
        id: "act-0819-1",
        label: "Tiket dibuat dari formulir web",
        time: "05:31",
        actor: "Sistem",
        tone: "muted",
      },
    ],
  },
];

export const mockFollowUpTickets: FollowUpTicket[] = [
  {
    id: "follow-up-0832",
    complaintId: "complaint-follow-up-0832",
    displayId: "EXT-2026-0832",
    status: "ready_to_notify",
    category: "delay",
    customerName: "Siti Nuraini",
    customerInitials: "SN",
    username: "@sitinuraini",
    sourceChannel: "twitter",
    sourceLabel: "Twitter",
    sourceType: "Tweet publik",
    externalUrl: "https://x.example.com/sitinuraini/status/0832",
    route: "Surabaya -> Jakarta",
    originalComplaint:
      "Kereta saya terlambat lebih dari 3 jam dari Surabaya ke Jakarta. Saya ada meeting penting dan tidak ada pemberitahuan sama sekali. Ini sangat mengecewakan!",
    submittedAt: "17 Mei 2026, 08:50",
    relativeTime: "12 menit lalu",
    safeReplyText:
      "Terima kasih sudah menyampaikan keluhan ini kepada kami. Kami memahami bahwa pengalaman ini tidak sesuai dengan harapan Kakak. Mohon maaf atas ketidaknyamanan yang terjadi. Laporan Kakak akan kami teruskan ke tim terkait untuk pengecekan dan tindak lanjut lebih lanjut.",
    safeReplyCopiedAt: "17 Mei, 08:51",
    safeReplyBy: "Rizky A.",
    managerAction: {
      status: "completed",
      managerName: "Mgr. Dina",
      completedAt: "Hari ini, 10:14",
      actionTaken:
        "Sudah dikoordinasikan dengan tim operasional. Pengembalian dana penuh disetujui untuk seluruh penumpang terdampak keterlambatan Surabaya-Jakarta pada 17 Mei. Dana akan diproses dalam 3-5 hari kerja ke metode pembayaran asal.",
      closureDraft:
        "Halo Kak Siti, kami ingin menginformasikan bahwa setelah berkoordinasi dengan tim operasional, pengembalian dana penuh untuk perjalanan Kakak pada 17 Mei telah disetujui. Dana akan dikembalikan dalam 3-5 hari kerja ke metode pembayaran asal. Terima kasih atas kesabaran Kakak, dan mohon maaf sekali lagi atas ketidaknyamanan yang terjadi.",
      references: [
        {
          displayType: "text",
          referenceLinkId: "ref-delay-sop",
          referenceSourceId: "ref-delay-sop",
          sourceType: "sop",
          tags: ["delay"],
          title: "SOP - penanganan keterlambatan v2.1",
          usageType: "closure_support",
          snapshotText:
            "Keterlambatan di atas 120 menit membutuhkan konfirmasi operasional.",
        },
        {
          displayType: "text",
          referenceLinkId: "ref-delay-past",
          referenceSourceId: "ref-delay-past",
          sourceType: "previous_action",
          tags: ["past_case"],
          title: "Tiket sebelumnya #0712",
          usageType: "evidence",
          snapshotText:
            "Keterlambatan rute yang sama disetujui untuk pengembalian dana penuh pada Maret 2026.",
        },
        {
          displayType: "text",
          referenceLinkId: "ref-delay-policy",
          referenceSourceId: "ref-delay-policy",
          sourceType: "policy",
          tags: ["policy"],
          title: "Kebijakan pengembalian dana v3.2",
          usageType: "policy_support",
          snapshotText:
            "Pengembalian dana diproses ke metode pembayaran asal setelah disetujui.",
        },
      ],
    },
    closureMessage:
      "Halo Kak Siti, kami ingin menginformasikan bahwa setelah berkoordinasi dengan tim operasional, pengembalian dana penuh untuk perjalanan Kakak pada 17 Mei telah disetujui. Dana akan dikembalikan dalam 3-5 hari kerja ke metode pembayaran asal. Terima kasih atas kesabaran Kakak, dan mohon maaf sekali lagi atas ketidaknyamanan yang terjadi.",
    priority: "high",
    activityLog: [
      {
        id: "act-0832-4",
        label: "Arahan manajer selesai - pengembalian dana disetujui",
        actor: "Mgr. Dina",
        time: "10:14",
        tone: "success",
      },
      {
        id: "act-0832-3",
        label: "Tindakan diminta oleh agen",
        actor: "Rizky A.",
        time: "08:52",
        tone: "warning",
      },
      {
        id: "act-0832-2",
        label: "Balasan aman disalin untuk Twitter",
        actor: "Rizky A.",
        time: "08:51",
        tone: "neutral",
      },
      {
        id: "act-0832-1",
        label: "Tiket dibuat dari Quick Response",
        actor: "Sistem",
        time: "08:50",
        tone: "neutral",
      },
    ],
  },
  {
    id: "follow-up-0833",
    complaintId: "complaint-follow-up-0833",
    displayId: "EXT-2026-0833",
    status: "ready_to_notify",
    category: "cancellation",
    customerName: "Budi Santoso",
    customerInitials: "BS",
    username: "@budisantoso",
    sourceChannel: "instagram",
    sourceLabel: "Instagram",
    sourceType: "DM",
    route: "Jakarta -> Yogyakarta",
    originalComplaint:
      "Saya harus membatalkan perjalanan karena jadwal berubah mendadak. Tolong bantu opsi terbaik karena tiket sudah dibayar.",
    submittedAt: "17 Mei 2026, 09:08",
    relativeTime: "28 menit lalu",
    safeReplyText:
      "Terima kasih sudah menghubungi kami. Kami memahami perubahan jadwal ini mengganggu rencana perjalanan Bapak. Mohon maaf atas ketidaknyamanan yang terjadi. Laporan ini kami teruskan untuk pengecekan opsi tindak lanjut.",
    safeReplyCopiedAt: "17 Mei, 09:09",
    safeReplyBy: "Rizky A.",
    managerAction: {
      status: "completed",
      managerName: "Mgr. Dina",
      completedAt: "Hari ini, 10:06",
      actionTaken:
        "Jadwal ulang disetujui tanpa biaya tambahan karena penyesuaian jadwal berasal dari operator.",
      closureDraft:
        "Halo Pak Budi, setelah pengecekan internal, pengajuan jadwal ulang Bapak telah disetujui tanpa biaya tambahan karena perubahan jadwal berasal dari pihak operator. Silakan lanjutkan melalui kanal bantuan resmi agar tim kami dapat membantu memilih jadwal pengganti yang tersedia.",
      references: [
        {
          displayType: "text",
          referenceLinkId: "ref-cancel-policy",
          referenceSourceId: "ref-cancel-policy",
          sourceType: "policy",
          tags: ["cancellation"],
          title: "Kebijakan jadwal ulang v2.4",
          usageType: "policy_support",
          snapshotText:
            "Perubahan dari operator memenuhi syarat untuk jadwal ulang gratis.",
        },
      ],
    },
    closureMessage:
      "Halo Pak Budi, setelah pengecekan internal, pengajuan jadwal ulang Bapak telah disetujui tanpa biaya tambahan karena perubahan jadwal berasal dari pihak operator. Silakan lanjutkan melalui kanal bantuan resmi agar tim kami dapat membantu memilih jadwal pengganti yang tersedia.",
    priority: "medium",
    activityLog: [
      {
        id: "act-0833-3",
        label: "Arahan manajer selesai - jadwal ulang disetujui",
        actor: "Mgr. Dina",
        time: "10:06",
        tone: "success",
      },
      {
        id: "act-0833-2",
        label: "Tiket dibuat dari Quick Response",
        actor: "Sistem",
        time: "09:08",
        tone: "neutral",
      },
    ],
  },
  {
    id: "follow-up-0834",
    complaintId: "complaint-follow-up-0834",
    displayId: "EXT-2026-0834",
    status: "ready_to_notify",
    category: "facility",
    customerName: "Dewi Rahayu",
    customerInitials: "DR",
    username: "@dewirahayu",
    sourceChannel: "facebook",
    sourceLabel: "Facebook",
    sourceType: "Komentar publik",
    route: "Malang -> Semarang",
    originalComplaint:
      "AC gerbong tidak berfungsi dan penumpang kepanasan sepanjang perjalanan. Ini perlu ditindaklanjuti.",
    submittedAt: "17 Mei 2026, 09:33",
    relativeTime: "40 menit lalu",
    safeReplyText:
      "Terima kasih sudah melaporkan kondisi fasilitas perjalanan. Kami memahami pengalaman ini tidak nyaman dan mohon maaf atas kendala yang terjadi. Laporan akan kami teruskan untuk pengecekan.",
    safeReplyCopiedAt: "17 Mei, 09:34",
    safeReplyBy: "Rizky A.",
    managerAction: {
      status: "completed",
      managerName: "Mgr. Andi",
      completedAt: "Hari ini, 10:10",
      actionTaken:
        "Tim fasilitas ditugaskan untuk memeriksa unit AC gerbong di depo tujuan. Voucher pemulihan layanan disetujui untuk penumpang terdampak.",
      closureDraft:
        "Halo Kak Dewi, terima kasih sudah menunggu. Tim fasilitas sudah dijadwalkan melakukan pengecekan unit AC gerbong di depo tujuan, dan voucher pemulihan layanan telah disetujui untuk penumpang terdampak. Mohon maaf atas ketidaknyamanan selama perjalanan.",
      references: [
        {
          displayType: "text",
          referenceLinkId: "ref-facility-note",
          referenceSourceId: "ref-facility-note",
          sourceType: "internal_note",
          tags: ["facility"],
          title: "Catatan penugasan fasilitas",
          usageType: "internal_note",
          snapshotText: "Pemeriksaan depo ditugaskan kepada tim fasilitas.",
        },
      ],
    },
    closureMessage:
      "Halo Kak Dewi, terima kasih sudah menunggu. Tim fasilitas sudah dijadwalkan melakukan pengecekan unit AC gerbong di depo tujuan, dan voucher pemulihan layanan telah disetujui untuk penumpang terdampak. Mohon maaf atas ketidaknyamanan selama perjalanan.",
    priority: "medium",
    activityLog: [
      {
        id: "act-0834-3",
        label: "Arahan manajer selesai - tim fasilitas ditugaskan",
        actor: "Mgr. Andi",
        time: "10:10",
        tone: "success",
      },
      {
        id: "act-0834-2",
        label: "Balasan aman disalin untuk Facebook",
        actor: "Rizky A.",
        time: "09:34",
      },
    ],
  },
  {
    id: "follow-up-0828",
    complaintId: "complaint-follow-up-0828",
    displayId: "EXT-2026-0828",
    status: "closed",
    category: "refund",
    customerName: "Ahmad Fauzi",
    customerInitials: "AF",
    username: "@ahmadf",
    sourceChannel: "google_play",
    sourceLabel: "Google Play",
    sourceType: "Ulasan aplikasi",
    originalComplaint:
      "Pengembalian dana belum diterima padahal sudah lama menunggu. Tolong jangan hanya disuruh menunggu.",
    submittedAt: "16 Mei 2026, 14:11",
    relativeTime: "Kemarin",
    safeReplyText:
      "Terima kasih atas ulasannya. Mohon maaf atas kendala pengembalian dana yang dialami. Kami akan bantu arahkan laporan ini untuk pengecekan lebih lanjut.",
    safeReplyCopiedAt: "16 Mei, 14:12",
    safeReplyBy: "Rizky A.",
    managerAction: {
      status: "completed",
      managerName: "Mgr. Dina",
      completedAt: "Kemarin, 16:35",
      actionTaken:
        "Status pengembalian dana terkonfirmasi. Dana sudah dikembalikan ke metode pembayaran asal.",
      closureDraft:
        "Halo Pak Ahmad, pengembalian dana Bapak telah dikonfirmasi berhasil dikembalikan ke metode pembayaran asal. Terima kasih atas kesabaran Bapak.",
      references: [
        {
          displayType: "text",
          referenceLinkId: "ref-refund-confirmation",
          referenceSourceId: "ref-refund-confirmation",
          sourceType: "internal_note",
          tags: ["refund"],
          title: "Konfirmasi pengembalian dana",
          usageType: "evidence",
          snapshotText:
            "Tim keuangan mengonfirmasi pengembalian dana berhasil.",
        },
      ],
    },
    closureMessage:
      "Halo Pak Ahmad, pengembalian dana Bapak telah dikonfirmasi berhasil dikembalikan ke metode pembayaran asal. Terima kasih atas kesabaran Bapak.",
    closureCopiedAt: "Kemarin, 16:42",
    closedAt: "Kemarin, 16:42",
    closedBy: "Rizky A.",
    priority: "low",
    activityLog: [
      {
        id: "act-0828-3",
        label: "Balasan akhir disalin dan tiket ditutup",
        actor: "Rizky A.",
        time: "16:42",
        tone: "success",
      },
      {
        id: "act-0828-2",
        label: "Arahan manajer selesai - pengembalian dana terkonfirmasi",
        actor: "Mgr. Dina",
        time: "16:35",
        tone: "success",
      },
    ],
  },
  {
    id: "follow-up-0835",
    complaintId: "complaint-follow-up-0835",
    displayId: "EXT-2026-0835",
    status: "waiting_manager",
    category: "payment",
    customerName: "Rina Marlina",
    customerInitials: "RM",
    username: "@rinamarlina",
    sourceChannel: "twitter",
    sourceLabel: "Twitter",
    sourceType: "Post publik",
    externalUrl: "https://x.example.com/rinamarlina/status/0835",
    originalComplaint:
      "Pembayaran sudah berhasil tapi tiket tidak muncul. Tolong segera dicek karena perjalanan saya besok pagi.",
    submittedAt: "17 Mei 2026, 10:02",
    relativeTime: "10 menit lalu",
    safeReplyText:
      "Terima kasih sudah menyampaikan kendala pembayaran ini kepada kami. Mohon maaf atas ketidaknyamanan yang terjadi. Laporan Kakak akan kami teruskan untuk pengecekan lebih lanjut.",
    safeReplyCopiedAt: "17 Mei, 10:03",
    safeReplyBy: "Rizky A.",
    managerAction: {
      status: "pending",
      references: [
        {
          displayType: "text",
          referenceLinkId: "ref-payment-sop",
          referenceSourceId: "ref-payment-sop",
          sourceType: "sop",
          tags: ["payment"],
          title: "SOP verifikasi pembayaran",
          usageType: "action_basis",
          snapshotText:
            "Pembayaran berhasil tanpa penerbitan tiket membutuhkan pengecekan tim keuangan.",
        },
      ],
    },
    closureMessage: "",
    priority: "urgent",
    activityLog: [
      {
        id: "act-0835-2",
        label: "Menunggu persetujuan manajer untuk verifikasi pembayaran",
        actor: "Sistem",
        time: "10:04",
        tone: "warning",
      },
      {
        id: "act-0835-1",
        label: "Tiket dibuat dari Quick Response",
        actor: "Sistem",
        time: "10:02",
        tone: "neutral",
      },
    ],
  },
];
