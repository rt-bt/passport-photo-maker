import React from 'react';
import {
  Cpu,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Activity,
  HardDrive,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { GpuServerStatus } from '../../types';
import { getActiveGpuAdapter } from '../../lib/hardwareDetection';

interface GpuHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GpuServerStatus | null;
  onLaunchStudio?: () => void;
}

export const GpuHardwareModal: React.FC<GpuHardwareModalProps> = ({
  isOpen,
  onClose,
  status,
  onLaunchStudio,
}) => {
  const adapter = getActiveGpuAdapter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System GPU Hardware Connection" maxWidth="md">
      <div className="space-y-5 text-slate-800 dark:text-slate-200">
        {/* Top Status Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 dark:border-emerald-700/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {status?.gpuName || 'Physical GPU Accelerator'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically connected to your system's physical graphics processor on page browse.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Pipeline Engine</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              {status?.engineMode === 'local_cuda'
                ? 'PyTorch CUDA 12'
                : status?.engineMode === 'webgpu_client'
                ? 'WebGPU Direct3D12/Vulkan'
                : 'WebGL2 Hardware'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Connection Latency</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              &lt; 1ms (Local Hardware)
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Power Preference</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              High Performance
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Privacy & Security</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Client-Side
            </span>
          </div>
        </div>

        {/* Feature Capabilities */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            Hardware-Accelerated Features Ready:
          </div>
          <ul className="grid grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              2K, 4K, 8K Super Resolution
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              Neural Facial Part Tuning
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              B&W to Color Inference
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              Bilateral Deblock & Denoise
            </li>
          </ul>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          {onLaunchStudio && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchStudio();
              }}
              className="py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Open AI Restoration Studio
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
