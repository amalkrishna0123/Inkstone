"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiVideo,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { api, GalleryVideo } from "@/src/lib/inkstone-api";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

interface VideoForm {
  title: string;
  description: string;
  category: string;
  order: string;
  is_active: boolean;
}

const BLANK_FORM: VideoForm = {
  title: "",
  description: "",
  category: "",
  order: "0",
  is_active: true,
};

// ── Upload helper via existing /api/upload route ──────────────────────────────
async function uploadFile(
  file: File,
  folder: string,
  onProgress: (pct: number) => void
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        if (data.error) return reject(new Error(data.error));
        resolve({ url: data.image_url as string, public_id: data.public_id as string });
      } else {
        try {
          const d = JSON.parse(xhr.responseText);
          reject(new Error(d.error || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.open("POST", "/api/upload");
    xhr.send(fd);
  });
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#ffea00] transition-all duration-200"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VideoPanel({ onRefresh }: { onRefresh?: () => void }) {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  type ModalMode = "create" | "edit" | null;
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<GalleryVideo | null>(null);

  // Form state
  const [form, setForm] = useState<VideoForm>(BLANK_FORM);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [videoUpload, setVideoUpload] = useState<UploadState>({ status: "idle" });
  const [thumbUpload, setThumbUpload] = useState<UploadState>({ status: "idle" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<GalleryVideo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const vids = await api.getAllGalleryVideos();
    setVideos(vids);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Open modals ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(BLANK_FORM);
    setVideoFile(null);
    setThumbFile(null);
    setVideoUpload({ status: "idle" });
    setThumbUpload({ status: "idle" });
    setFormError("");
    setEditTarget(null);
    setModalMode("create");
  };

  const openEdit = (v: GalleryVideo) => {
    setForm({
      title: v.title,
      description: v.description,
      category: v.category ?? "",
      order: String(v.order ?? 0),
      is_active: v.is_active,
    });
    setVideoFile(null);
    setThumbFile(null);
    setVideoUpload({ status: "idle" });
    setThumbUpload({ status: "idle" });
    setFormError("");
    setEditTarget(v);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (modalMode === "create" && !videoFile) {
      setFormError("Please choose a video file to upload.");
      return;
    }

    setSaving(true);
    try {
      let videoUrl = editTarget?.video_url ?? "";
      let videoPublicId = editTarget?.cloudinary_public_id ?? "";
      let thumbUrl = editTarget?.thumbnail_url ?? "";
      let thumbPublicId = editTarget?.thumbnail_cloudinary_id ?? "";

      // Upload video (if new file chosen)
      if (videoFile) {
        setVideoUpload({ status: "uploading", progress: 0 });
        try {
          const r = await uploadFile(videoFile, "gallery_videos", (p) =>
            setVideoUpload({ status: "uploading", progress: p })
          );
          videoUrl = r.url;
          videoPublicId = r.public_id;
          setVideoUpload({ status: "success" });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Video upload failed";
          setVideoUpload({ status: "error", message: msg });
          setFormError(`Video upload error: ${msg}`);
          setSaving(false);
          return;
        }
      }

      // Upload thumbnail (optional)
      if (thumbFile) {
        setThumbUpload({ status: "uploading", progress: 0 });
        try {
          const r = await uploadFile(thumbFile, "gallery_thumbnails", (p) =>
            setThumbUpload({ status: "uploading", progress: p })
          );
          thumbUrl = r.url;
          thumbPublicId = r.public_id;
          setThumbUpload({ status: "success" });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Thumbnail upload failed";
          setThumbUpload({ status: "error", message: msg });
          setFormError(`Thumbnail upload error: ${msg}`);
          setSaving(false);
          return;
        }
      }

      // Build payload — omit keys with undefined/empty values so Firestore doesn't reject them
      const payload: Omit<GalleryVideo, "id"> = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || "",
        order: parseInt(form.order) || 0,
        is_active: form.is_active,
        video_url: videoUrl,
        cloudinary_public_id: videoPublicId,
        thumbnail_url: thumbUrl || "",
        created_at: editTarget?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(thumbPublicId ? { thumbnail_cloudinary_id: thumbPublicId } : {}),
      };

      if (modalMode === "create") {
        await api.createGalleryVideo(payload);
      } else if (editTarget) {
        await api.updateGalleryVideo(editTarget.id, payload);
      }

      await load();
      onRefresh?.();
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save video.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteGalleryVideo(
        deleteTarget.id,
        deleteTarget.cloudinary_public_id,
        deleteTarget.thumbnail_cloudinary_id
      );
      await load();
      onRefresh?.();
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleActive = async (v: GalleryVideo) => {
    await api.updateGalleryVideo(v.id, { is_active: !v.is_active });
    await load();
  };

  // ── File validation ───────────────────────────────────────────────────────
  const handleVideoFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFormError("Please choose a valid video file.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setFormError("Video must be less than 500 MB.");
      return;
    }
    setVideoFile(file);
    setVideoUpload({ status: "idle" });
    setFormError("");
  };

  const handleThumbFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose a valid image file for the thumbnail.");
      return;
    }
    setThumbFile(file);
    setThumbUpload({ status: "idle" });
    setFormError("");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const inputCls =
    "w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ffea00] rounded-sm";
  const btnCls =
    "bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50";

  return (
    <>
      <Header title="Gallery Videos" description="Manage videos displayed in the About Gallery section." />

      {/* Top action bar */}
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className={`${btnCls} flex items-center gap-2`}>
          <FiPlus /> Add Video
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400 text-sm">Loading…</div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
          <FiVideo className="text-4xl" />
          <p className="text-sm">No videos yet. Click "Add Video" to upload one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-200 bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="p-4">
                    <div className="w-20 h-12 bg-black rounded-lg overflow-hidden relative">
                      {v.thumbnail_url ? (
                        <img
                          src={v.thumbnail_url}
                          alt={v.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white/40">
                          <FiVideo />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <p className="font-medium line-clamp-2 leading-snug">{v.title}</p>
                    {v.description && (
                      <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{v.description}</p>
                    )}
                  </td>
                  <td className="p-4">
                    {v.category ? (
                      <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {v.category}
                      </span>
                    ) : (
                      <span className="text-neutral-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-xs text-neutral-500">{v.order ?? 0}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(v)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        v.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      {v.is_active ? <FiEye className="text-xs" /> : <FiEyeOff className="text-xs" />}
                      {v.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(v)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Upload / Edit Modal ── */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="w-full max-w-lg bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold">
                  {modalMode === "create" ? "Upload New Video" : "Edit Video"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {modalMode === "create"
                    ? "Video is uploaded to Cloudinary. Metadata stored in Firestore."
                    : "Update video metadata or replace the video/thumbnail file."}
                </p>
              </div>
              <button onClick={closeModal} className="text-2xl text-neutral-400 hover:text-neutral-900 leading-none">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <FiAlertCircle className="mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Title *</label>
                <input
                  className={inputCls}
                  required
                  placeholder="Enter video title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="Short description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Category + Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Crystal Care"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Display Order</label>
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                  />
                </div>
              </div>

              {/* Video file */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Video File {modalMode === "create" ? "*" : "(leave blank to keep existing)"}
                </label>
                <div
                  className="border-2 border-dashed border-neutral-200 rounded-lg p-4 cursor-pointer hover:border-neutral-400 transition-colors text-center"
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleVideoFile(e.dataTransfer.files[0] ?? null);
                  }}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleVideoFile(e.target.files?.[0] ?? null)}
                  />
                  {videoFile ? (
                    <div className="flex items-center gap-2 justify-center text-sm text-neutral-700">
                      <FiCheck className="text-green-500" />
                      <span className="font-medium">{videoFile.name}</span>
                      <span className="text-neutral-400">({formatBytes(videoFile.size)})</span>
                    </div>
                  ) : editTarget?.video_url ? (
                    <div className="text-xs text-neutral-500">
                      <FiVideo className="inline mr-1.5" />
                      Existing video — drag & drop or click to replace
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-500">
                      <FiUpload className="inline mr-1.5" />
                      Drag & drop or click to choose video (max 500 MB)
                    </div>
                  )}
                </div>
                {videoUpload.status === "uploading" && (
                  <div className="mt-2 space-y-1">
                    <ProgressBar value={videoUpload.progress} />
                    <p className="text-xs text-neutral-500">Uploading… {videoUpload.progress}%</p>
                  </div>
                )}
                {videoUpload.status === "success" && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><FiCheck /> Video uploaded.</p>
                )}
                {videoUpload.status === "error" && (
                  <p className="mt-1 text-xs text-red-600">{videoUpload.message}</p>
                )}
              </div>

              {/* Thumbnail file */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Thumbnail Image (optional)
                </label>
                <div
                  className="border-2 border-dashed border-neutral-200 rounded-lg p-4 cursor-pointer hover:border-neutral-400 transition-colors text-center"
                  onClick={() => thumbInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleThumbFile(e.dataTransfer.files[0] ?? null);
                  }}
                >
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleThumbFile(e.target.files?.[0] ?? null)}
                  />
                  {thumbFile ? (
                    <div className="flex items-center gap-2 justify-center text-sm text-neutral-700">
                      <FiCheck className="text-green-500" />
                      <span className="font-medium">{thumbFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-500">
                      <FiUpload className="inline mr-1.5" />
                      Drag & drop or click to choose thumbnail image
                    </div>
                  )}
                </div>
                {thumbUpload.status === "uploading" && (
                  <div className="mt-2 space-y-1">
                    <ProgressBar value={thumbUpload.progress} />
                    <p className="text-xs text-neutral-500">Uploading… {thumbUpload.progress}%</p>
                  </div>
                )}
                {thumbUpload.status === "success" && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><FiCheck /> Thumbnail uploaded.</p>
                )}
              </div>

              {/* Active */}
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 accent-neutral-950"
                />
                Show in gallery (active)
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="border border-neutral-300 px-4 py-2.5 text-sm hover:bg-neutral-100"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button className={btnCls} disabled={saving}>
                  {saving ? (videoUpload.status === "uploading" ? "Uploading…" : "Saving…") : modalMode === "create" ? "Upload Video" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div className="w-full max-w-sm bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
            <h3 className="text-lg font-bold mb-2">Delete Video?</h3>
            <p className="text-sm text-neutral-600 mb-1">
              <span className="font-semibold">{deleteTarget.title}</span> will be permanently removed from Cloudinary
              and Firestore. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                className="border border-neutral-300 px-4 py-2.5 text-sm hover:bg-neutral-100"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

