// ==========================================
// KONFIGURASI GLOBAL BOT WANN
// ==========================================

// 1. Konfigurasi Owner & Admin
// Format: [['Nomor', 'Nama Lengkap/Instansi']]
global.owner = [
    ['6285324023198', 'Mitraaa Developer']
]

// Sesuaikan Nomor Admin Grup (Gunakan @s.whatsapp.net di akhir nomor)
global.admin = ['6285324023198@s.whatsapp.net', '6282215415550@s.whatsapp.net'] 

// 2. Konfigurasi Dasar
global.prefix = '.' // Awalan perintah bot

// 3. Custom Message (Pesan Template)
global.mess = {
    wait: '☕ *One Moment, Please*',
    error: '⚠ *Gagal Saat Melakukan Proses*',
    default: '📑 *Perintah Tidak Dikenali*',
    admin: '⚠ *Perintah Ini Hanya Bisa Digunakan Oleh Admin*',
    group: '⚠ *Perintah Ini Hanya Bisa Digunakan Di Dalam Grup*',
}