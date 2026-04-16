import { type DragEvent, useRef, useState } from "react";

type Props = {
  onUpload: (icsContent: string) => void;
  isLoading: boolean;
};

export default function UploadSection({ onUpload, isLoading }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    if (!file.name.endsWith(".ics")) {
      setFileError("Please upload a .ics calendar file.");
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        onUpload(content);
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  return (
    <div
      className="rounded-2xl p-10 text-center cursor-pointer transition-all"
      style={{
        border: `2px dashed ${isDragging ? "var(--color-asu-gold)" : "rgba(255,255,255,0.18)"}`,
        background: isDragging ? "rgba(255,198,39,0.06)" : "rgba(255,255,255,0.02)",
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".ics"
        className="hidden"
        onChange={handleFileChange}
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-asu-gold)", borderTopColor: "transparent" }}
          />
          <p className="text-gray-400 text-sm">Uploading your schedule…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "rgba(255,198,39,0.1)", border: "1px solid rgba(255,198,39,0.2)" }}
          >
            📅
          </div>
          <div>
            <p className="text-white font-semibold">Drag your .ics file here</p>
            <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          </div>
          {fileError ? (
            <p className="text-red-400 text-xs mt-1">{fileError}</p>
          ) : (
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              MyASU → Academics → Schedule → Export Calendar (.ics)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
