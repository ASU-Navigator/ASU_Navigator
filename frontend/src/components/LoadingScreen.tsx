type Props = { message?: string };

export default function LoadingScreen({ message = "Loading…" }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-950">
      <div
        className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: "var(--color-asu-gold)", borderTopColor: "transparent" }}
      />
      <p className="text-gray-300 text-sm">{message}</p>
    </div>
  );
}
