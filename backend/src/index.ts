import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

// Initialize dotenv
dotenv.config();

// connectDB(); step 13
const app = express();
const PORT = process.env.PORT || 5000;
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {polling: true});
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);

// Middleware
app.use(cors());
app.use(express.json());

// Command list
const commandList = `
Selamat datang di Aplikasi Job Management! Berikut daftar perintah yang tersedia:

1. /start - Memulai aplikasi  
2. /register - Mendaftar sebagai pengguna  
3. /task - Melihat daftar tugas hari ini  
4. /report [TaskId] [Deskripsi] - Mengirim laporan penyelesaian tugas  
5. /help - Melihat daftar perintah
`;

function generateCustomId(prefix: string, length: number, lastId: string) {
  if (!lastId) return `${prefix}${'1'.padStart(length, '0')}`;
  const number = parseInt(lastId.replace(prefix, '')) + 1;
  return `${prefix}${number.toString().padStart(length, '0')}`;
}

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// /register
bot.onText(/^\/register/, async (msg) => {
  const telegram_id = msg.chat.id;
  const username = msg.chat.username || msg.chat.first_name;

  const { data: existingUsers } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegram_id);

  if ((existingUsers?.length as number) > 0) {
    return bot.sendMessage(telegram_id, `Anda dengan nama: ${username} telah terdaftar sebagai pekerja.`);
  }

  const { error } = await supabase.from('users').insert([
    { name: username, telegram_id, role: 'worker' },
  ]);

  if (error) return bot.sendMessage(telegram_id, 'Gagal mendaftar. Coba lagi.');
  bot.sendMessage(telegram_id, `Pendaftaran berhasil. Selamat datang ${username} sebagai pekerja baru.`);
});

// task
bot.onText(/^\/task/, async (msg) => {
  const telegram_id = msg.chat.id;
  const today = dayjs().format('YYYY-MM-DD');

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_date', today);

  if (!tasks || tasks.length === 0) {
    return bot.sendMessage(telegram_id, 'Tidak ada pekerjaan hari ini.');
  }

  const { data: reports } = await supabase
    .from('task_reports')
    .select('*')
    .eq('submitted_by', telegram_id);

  let response = 'Tugas Hari Ini:\n';
  tasks.forEach((task) => {
    const report = reports?.find(r => r.task_id === task.id);
    let status = 'belum mengerjakan';
    if (report) status = report.status || 'pending';

    response += `• ${task.title} - ${status}\n`;
  });

  bot.sendMessage(telegram_id, response);
});

// /report [taskId]
bot.onText(/^\/report\s+(\w+)/, async (msg, match) => {
  const telegram_id = msg.chat.id;
  const taskId = match?.[1];
  const today = dayjs().format('YYYY-MM-DD');

  // Cek apakah TaskId valid dan sesuai dengan hari ini
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_date', today)
    .eq('id', taskId);

  if (!tasks || tasks.length === 0) {
    return bot.sendMessage(telegram_id, 'Tidak ada pekerjaan dengan kode tersebut.');
  }

  // Ambil ID terakhir dari laporan untuk generate SUB ID
  const { data: existingReports } = await supabase
    .from('task_reports')
    .select('id')
    .order('id', { ascending: true });

  const lastReportId = existingReports?.length ? existingReports[existingReports.length - 1].id : null;
  const newReportId = generateCustomId('SUB', 3, lastReportId);

  // Insert laporan tanpa kolom deskripsi
  const { error } = await supabase.from('task_reports').insert([
    {
      id: newReportId,
      task_id: taskId,
      submitted_by: telegram_id,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      reviewed_by: "supervisor",
      notified: false
    },
  ]);

  if (error) return bot.sendMessage(telegram_id, 'Gagal mengirim laporan. Coba lagi nanti.');
  bot.sendMessage(telegram_id, 'Laporan Anda telah terkirim. Cek status di /task.');
});

// /start dan /help
bot.onText(/^\/(start|help)/, (msg) => {
  bot.sendMessage(msg.chat.id, commandList);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});