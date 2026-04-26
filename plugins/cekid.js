/**
 * Plugin: Cek ID / Nomor
 * Description: Melihat ID atau nomor WhatsApp yang terbaca oleh bot
 * Location: ./plugins/cekid.js
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    // Mengambil nama dan nomor pengirim (yang sudah melewati proses resolver)
    let sender = m.sender || m.key.remoteJid || '';
    let pushname = m.pushName || "Pengguna";

    let teks = `👋 Halo *${pushname}*!\n\n`;
    teks += `Sistem keamanan dan resolver bot mendeteksi nomor kamu sebagai:\n`;
    teks += `*${sender}*\n\n`;
    
    if (sender.endsWith('@s.whatsapp.net')) {
        teks += `✅ _Resolusi sukses! Nomor aslimu berhasil terbaca._`;
    } else if (sender.endsWith('@lid')) {
        teks += `⚠ _Resolusi gagal/tertunda. Kamu masih terbaca sebagai LID._`;
    }

    await m.reply(teks);
}

handler.help = ['cekid', 'myid', 'id']
handler.tags = ['umum']
handler.description = 'Mengecek nomor WhatsApp kamu yang terbaca oleh sistem bot'
handler.command = /^(cekid|myid|id)$/i

// Bebas diakses oleh siapa saja (user biasa)
handler.limit = false
handler.premium = false

module.exports = handler;