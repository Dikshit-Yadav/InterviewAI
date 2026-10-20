export default function ProfileHeader() {
  const name = (() => {
    const value = sessionStorage.getItem("name");
    if (!value) return null;

    try {
      return JSON.parse(value) as string | null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-brand text-primary-foreground flex items-center justify-center text-xl font-bold">
        {name?.charAt(0) || "U"}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        {/* <p className="text-gray-400">{email}</p> */}
      </div>
    </div>
  );
}