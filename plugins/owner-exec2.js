/**
 * Plugin: Terminal Exec ($)
 * Description: Menjalankan perintah terminal/shell dari WhatsApp
 * Location: ./plugins/owner-exec2.js
 */

const cp = require('child_process');
const { promisify } = require('util');
const exec = promisify(cp.exec).bind(cp);

let handler = async (m, { conn, command, text }) => {
    // Keamanan Tingkat Tinggi: Hanya Owner / Admin yang ada di config.js yang bisa pakai
    const isOwner = global.owner.some(v => m.sender.includes(v[0])) || global.admin.includes(m.sender);
    if (!isOwner) return m.reply("⚠ *Akses Ditolak:* Perintah ini khusus untuk Mitraaa!");

    if (!text) return m.reply('💻 *Masukkan perintah terminal!*\nContoh: `$ ls` atau `$ npm ls`');
    
    await m.reply('⏳ *Executing...*');
    
    let o;
    try {
        o = await exec(text.trim());
    } catch (e) {
        o = e;
    } finally {
        let { stdout, stderr } = o;
        if (stdout && stdout.trim()) await m.reply(stdout);
        if (stderr && stderr.trim()) await m.reply(stderr);
    }
}

handler.help = ['$ <command>']
handler.tags = ['owner']
handler.description = 'Menjalankan perintah CMD / Terminal'
// Menggunakan RegExp yang menangkap prefix '$'
handler.command = /^[$]$/i 

handler.limit = false
handler.premium = false

module.exports = handler;