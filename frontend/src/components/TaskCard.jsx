import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { supabase } from "../lib/supabase";
import Swal from 'sweetalert2';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function TaskCard({ task, onStatusUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const employeeName = task.users?.name || "Nama tidak tersedia";
  const taskTitle = task.tasks?.title || "Judul tugas tidak tersedia";
  const status = task.status || "pending";
  const photoUrl = task.photo_url;
  const keterangan = task.keterangan || "-";
  const submittedAt = new Date(task.submitted_at).toLocaleString('id-ID');

  const handleApprove = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('task_reports')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Laporan berhasil disetujui',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
      });

      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      console.error('Error approving report:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal menyetujui laporan',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejected = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Alasan Penolakan',
      input: 'textarea',
      inputLabel: 'Berikan alasan penolakan',
      inputPlaceholder: 'Masukkan alasan penolakan...',
      showCancelButton: true,
      confirmButtonText: 'Tolak Laporan',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) return 'Harap masukkan alasan penolakan';
      }
    });

    if (reason) {
      try {
        setIsUpdating(true);
        const { error } = await supabase
          .from('task_reports')
          .update({
            status: 'rejected',
            review_notes: reason,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;

        await Swal.fire({
          title: 'Ditolak!',
          text: 'Laporan berhasil ditolak',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
        });

        if (onStatusUpdate) onStatusUpdate();
      } catch (error) {
        console.error('Error rejecting report:', error);
        await Swal.fire({
          title: 'Error!',
          text: 'Gagal menolak laporan',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const confirmApprove = () => {
    Swal.fire({
      title: 'Setujui Laporan?',
      text: 'Anda yakin ingin menyetujui laporan ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        handleApprove();
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{taskTitle}</h3>
          <p className="text-sm text-gray-600">{employeeName}</p>
          <p className="text-xs text-gray-500">Dikirim: {submittedAt}</p>
        </div>
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
          Menunggu Review
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Keterangan:</span> {keterangan}
        </p>
      </div>

      {photoUrl ? (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Bukti Pekerjaan:</p>
          <img
            src={photoUrl}
            alt="Bukti pekerjaan"
            className="rounded-xl w-full h-52 object-cover hover:scale-105 transition-transform cursor-pointer border"
            onClick={() => setIsOpen(true)}
          />
          {/* Image Modal */}
          <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="max-w-4xl w-full bg-white rounded-lg p-4">
                <img src={photoUrl} alt="Preview" className="w-full max-h-[75vh] object-contain" />
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic mb-4">Tidak ada gambar laporan</p>
      )}

      <div className="flex gap-4 pt-4 border-t mt-4">
        <button
          onClick={confirmApprove}
          disabled={isUpdating}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {isUpdating ? "Memproses..." : "Setujui"}
        </button>
        <button
          onClick={handleRejected}
          disabled={isUpdating}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition disabled:bg-red-400 disabled:cursor-not-allowed"
        >
          <XCircleIcon className="h-5 w-5" />
          {isUpdating ? "Memproses..." : "Tolak"}
        </button>
      </div>
    </div>
  );
}
