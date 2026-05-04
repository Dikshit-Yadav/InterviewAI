export default function ProfileInfo() {
  const name = JSON.parse(sessionStorage.getItem("name"));
    const role = JSON.parse(sessionStorage.getItem("role"));
    const email = JSON.parse(sessionStorage.getItem("email"));

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
      <h3 className="mb-4 font-semibold">Profile Info</h3>

      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <p>Target Role: {role}</p>
    </div>
  );
}