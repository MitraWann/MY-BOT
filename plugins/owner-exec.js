/**
 * Plugin: JS Evaluator (> / =>)
 * Description: Mengeksekusi kode JavaScript/Node.js secara langsung
 * Location: ./plugins/owner-exec.js
 */

let syntaxerror;
try {
    syntaxerror = require('syntax-error');
} catch (e) {
    syntaxerror = null; // Mengabaikan error jika module belum diinstal
}
const util = require('util');

let handler = async (m, extra) => {
    const { conn, command, text, args } = extra;
    
    // Mendapatkan nomor WhatsApp pengirim dengan aman (support simple.js jika ada)
    const sender = m.sender || m.key?.participant || m.key?.remoteJid || '';
    const isBotOwner = m.key?.fromMe; // Deteksi jika perintah diketik langsung dari HP/akun bot
    
    // Keamanan Tingkat Tinggi: Hanya Owner / Bot Sendiri
    const ownerData = global.owner || [['6282215415550', 'Mitraaa Fallback']];
    const adminData = global.admin || [];
    
    const isOwner = isBotOwner || ownerData.some(v => sender.includes(v[0])) || adminData.includes(sender);
    
    // MENAMBAHKAN DEBUG INFO JIKA AKSES DITOLAK
    if (!isOwner) {
        let debugMsg = `⚠ *Akses Ditolak:* Perintah ini khusus untuk Mitraaa!\n\n`;
        debugMsg += `*-- Debug Info --*\n`;
        debugMsg += `Nomor Kamu: ${sender}\n`;
        debugMsg += `Data Owner Bot: ${JSON.stringify(ownerData)}\n`;
        debugMsg += `_Jika data owner salah, pastikan config.js sudah ter-require dan bot sudah di-restart._`;
        return m.reply(debugMsg);
    }

    if (!text) return m.reply('💻 *Masukkan kode JavaScript!*\nContoh: `> console.log("Halo")`');

    let _return;
    let _syntax = '';
    // Jika menggunakan => maka akan otomatis menambahkan 'return ' di depannya
    let _text = (/^=>/.test(command) ? 'return ' : '') + text;
    
    try {
        let i = 15; // Limit console.log
        let f = { exports: {} };
        
        // Membangun fungsi eksekusi virtual
        let exec = new (async () => {}).constructor('print', 'm', 'handler', 'require', 'conn', 'Array', 'process', 'args', 'module', 'exports', _text);
        
        _return = await exec.call(conn, (...args) => {
            if (--i < 1) return;
            console.log(...args);
            return m.reply(util.format(...args));
        }, m, handler, require, conn, CustomArray, process, args, f, f.exports);
        
    } catch (e) {
        let err;
        if (syntaxerror) {
            err = syntaxerror(_text, 'Execution Function', {
                allowReturnOutsideFunction: true,
                allowAwaitOutsideFunction: true
            });
        }
        if (err) _syntax = '```' + err + '```\n\n';
        _return = e;
    } finally {
        await m.reply(_syntax + util.format(_return));
    }
}

handler.help = ['> <code>', '=> <code>']
handler.tags = ['owner']
handler.description = 'Evaluasi kode JavaScript'
// Menangkap perintah '>' atau '=>'
handler.command = /^(>|=>)$/i 

handler.limit = false
handler.premium = false

module.exports = handler;

class CustomArray extends Array {
    constructor(...args) {
        if (typeof args[0] == 'number') return super(Math.min(args[0], 10000));
        else return super(...args);
    }
}