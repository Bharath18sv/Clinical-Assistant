export default function InputField({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">{label}</label>
      <input {...props} className="w-full border p-2 rounded" />
    </div>
  );
}
