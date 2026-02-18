import { AnaboliLogo } from '../assets';

export function Avatar({ rounded = true }: { rounded?: boolean } = {}) {
  return (
    <img
      src={AnaboliLogo}
      alt="Asistente Anaboli"
      className={`w-full h-full object-cover ${rounded ? 'rounded-full' : ''}`}
    />
  );
}
