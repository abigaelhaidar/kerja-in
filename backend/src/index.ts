import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

// Initialize dotenv
dotenv.config();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// connectDB(); step 13
const app = express();
const PORT = process.env.PORT || 5000;
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {polling: true});
const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);

// Middleware
app.use(cors());
app.use(express.json());

const userReportState: Record<number, string> = {}; // telegram_id -> taskId

// Command list
const commandList = `
Selamat datang di Aplikasi Job Management! Berikut daftar perintah yang tersedia:

1. /start - Memulai aplikasi  
2. /register - Mendaftar sebagai pengguna  
3. /task - Melihat daftar tugas hari ini  
4. /report [TaskId] - Mengirim laporan penyelesaian tugas  
5. /help - Melihat daftar perintah
`;

function generateCustomId(prefix: string, length: number, lastId: string) {
  if (!lastId) return `${prefix}${'1'.padStart(length, '0')}`;
  const number = parseInt(lastId.replace(prefix, '')) + 1;
  return `${prefix}${number.toString().padStart(length, '0')}`;
}

async function isUserRegistered(telegram_id: number) {
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegram_id);
  return users && users.length > 0;
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

  const isRegistered = await isUserRegistered(telegram_id);
  if (!isRegistered) {
    return bot.sendMessage(telegram_id, 'Anda belum terdaftar. Silakan daftar dengan perintah /register');
  }

  const today = dayjs().format('YYYY-MM-DD');

  // Ambil semua task untuk hari ini
  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_date', today);

  if (taskError || !tasks || tasks.length === 0) {
    return bot.sendMessage(telegram_id, 'Tidak ada pekerjaan hari ini.');
  }

  // Ambil semua laporan user dan urutkan berdasarkan created_at terbaru
  const { data: reports, error: reportError } = await supabase
    .from('task_reports')
    .select('*')
    .eq('submitted_by', telegram_id)
    .order('created_at', { ascending: false }); // Urut dari terbaru

  if (reportError) {
    return bot.sendMessage(telegram_id, 'Gagal mengambil laporan.');
  }

  // Simpan hanya laporan terbaru per task_id
  const latestReports = new Map();
  for (const report of reports) {
    if (!latestReports.has(report.task_id)) {
      latestReports.set(report.task_id, report);
    }
  }

  // Susun respons
  let response = '📋 *Tugas Hari Ini:*\n\n';
  for (const task of tasks) {
    const report = latestReports.get(task.id);
    const status = report ? (report.status || 'pending') : 'belum mengerjakan';
    response += `• ${task.id} - ${task.title} - _${status}_\n`;
  }

  bot.sendMessage(telegram_id, response, { parse_mode: 'Markdown' });
});

// /report [taskId]
bot.on('message', async (msg: any) => {
  const telegram_id = msg.chat.id;
  const text = msg.caption || msg.text;
  const today = dayjs().format('YYYY-MM-DD');

  // Deteksi command /report [taskId] dari caption atau text
  const match = text?.match(/^\/report\s+(\w+)/);
  const taskId = match?.[1];

  if (!taskId) return; // Bukan command /report

  const isRegistered = await isUserRegistered(telegram_id);
  if (!isRegistered) {
    return bot.sendMessage(telegram_id, 'Anda belum terdaftar. Gunakan /register untuk mendaftar.');
  }

  // Pastikan ada foto
  if (!msg.photo || msg.photo.length === 0) {
    return bot.sendMessage(telegram_id, 'Mohon kirim laporan dengan foto tugas.');
  }

  // Ambil file_id dengan resolusi tertinggi
  const fileId = msg.photo[msg.photo.length - 1].file_id;
  const fileInfo = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

  // Upload ke Cloudinary
  let photo_url = '';
  try {
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
    });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'job-management' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      response.data.pipe(stream);
    });

    photo_url = (uploadResult as any).secure_url;
  } catch (err) {
    console.error('Upload error:', err);
    return bot.sendMessage(telegram_id, 'Gagal mengunggah foto.');
  }

  // Validasi task hari ini
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_date', today)
    .eq('id', taskId);

  if (!tasks || tasks.length === 0) {
    return bot.sendMessage(telegram_id, 'Tidak ada pekerjaan dengan kode tersebut hari ini.');
  }

  // Generate SUB ID
  const { data: existingReports } = await supabase
    .from('task_reports')
    .select('id')
    .order('id', { ascending: true });

  const lastReportId = existingReports?.length ? existingReports[existingReports.length - 1].id : null;
  const newReportId = generateCustomId('SUB', 3, lastReportId);

  // Simpan ke Supabase
  const { error } = await supabase.from('task_reports').insert([
    {
      id: newReportId,
      task_id: taskId,
      submitted_by: telegram_id,
      photo_url,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      reviewed_by: "supervisor",
      notified: false,
    },
  ]);

  if (error) {
    console.error(error);
    return bot.sendMessage(telegram_id, 'Gagal menyimpan laporan. Coba lagi nanti.');
  }

  bot.sendMessage(telegram_id, 'Laporan dengan foto telah terkirim. Cek status di /task.');
});

// /start dan /help
bot.onText(/^\/(start|help)/, (msg) => {
  bot.sendMessage(msg.chat.id, commandList);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});