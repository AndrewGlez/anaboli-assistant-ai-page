import { AnaboliLogo } from "../assets";

export function Avatar() {
  return (
    <img
      src={AnaboliLogo}
      alt="Asistente Anaboli"
      className="w-full h-full object-cover"
    />
  );
}
