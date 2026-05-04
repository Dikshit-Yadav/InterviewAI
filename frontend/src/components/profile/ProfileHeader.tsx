export default function ProfileHeader() {
  const name = JSON.parse(sessionStorage.getItem("name"));
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-xl font-bold">
        {name?.charAt(0) || "U"}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        {/* <p className="text-gray-400">{email}</p> */}
      </div>
    </div>
  );
}