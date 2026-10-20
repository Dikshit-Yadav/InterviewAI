export default function ProfileInfo() {
  const getStoredValue = (key: string) => {
    const value = sessionStorage.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as string | null;
    } catch {
      return null;
    }
  };

  const name = getStoredValue("name");
  const role = getStoredValue("role");
  const email = getStoredValue("email");

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
      <h3 className="mb-4 font-semibold">Profile Info</h3>

      <p>Name: {name ?? "Not available"}</p>
      <p>Email: {email ?? "Not available"}</p>
      <p>Target Role: {role ?? "Not available"}</p>
    </div>
  );
}