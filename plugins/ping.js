/**
 * Plugin: Ping
 * Description: Mengecek status dan kecepatan respon bot
 * Location: ./plugins/ping.js
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    // Mencatat waktu sebelum membalas untuk mengukur latensi
    const start = new Date().getTime();
    
    // Mengirim pesan pong
    await m.reply('🏓 *Pong!*\nSedang menghitung kecepatan...');
    
    // Mencatat waktu setelah membalas
    const end = new Date().getTime();
    
    // Mengedit pesan atau mengirim pesan baru dengan hasil kecepatan
    await m.reply(`🏓 *Pong!*\n\nBot aktif dan merespon dalam kecepatan *${end - start} ms*`);
}

handler.help = ['ping', 'p', 'speed']
handler.tags = ['umum']
handler.description = 'Mengecek apakah bot aktif dan melihat kecepatan responnya'
handler.command = /^(ping|p|speed)$/i

// Tidak membutuhkan limit atau status premium
handler.limit = false
handler.premium = false

module.exports = handler;