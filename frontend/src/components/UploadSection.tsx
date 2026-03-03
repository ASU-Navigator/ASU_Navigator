import { type DragEvent, useRef, useState } from "react";

type Props = {
  onUpload: (icsContent: string) => void;
  isLoading: boolean;
};

export default function UploadSection({ onUpload, isLoading }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    if (!file.name.endsWith(".ics")) {
      alert("Please upload a .ics calendar file.");
      return;
    }
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
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
        isDragging
          ? "border-[var(--color-asu-gold)] bg-yellow-900/10"
          : "border-white/20 hover:border-white/40"
      }`}
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
            className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-asu-gold)", borderTopColor: "transparent" }}
          />
          <p className="text-gray-400 text-sm">Uploading your schedule…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl">📅</div>
          <div>
            <p className="text-white font-medium">Drag your .ics file here</p>
            <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Export from MyASU → Academics → Schedule → Export Calendar (.ics)
          </p>
        </div>
      )}
    </div>
  );
}
